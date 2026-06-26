"""
PoultryPulse AI — Document Library API
File: apps/api/batch_documents.py
Version: v1.0 | June 2026
Task: TASK-GAP7-API-001
Requirements: REQ-GAP7-DOC-001 through REQ-GAP7-DOC-005
Description: API endpoints for farm document management with Supabase Storage
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException, Request, UploadFile, File, Form
from supabase import Client
import structlog
from datetime import datetime, date, timedelta
import uuid
import os
from pathlib import Path

logger = structlog.get_logger()

# Valid document types
VALID_DOC_TYPES = [
    'chick_invoice', 'feed_invoice', 'vaccination_cert', 'medicine_bill',
    'movement_permit', 'sale_invoice', 'lab_report', 'insurance',
    'batch_closure_report', 'other'
]

# Valid file extensions
VALID_FILE_EXTS = ['pdf', 'jpg', 'jpeg', 'png', 'heif', 'heic']

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes


async def verify_farm_ownership(supabase: Client, farm_id: str, customer_id: str) -> bool:
    """
    Verify that the farm belongs to the authenticated customer/integrator.
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID to verify
        customer_id: Customer ID from JWT token
        
    Returns:
        True if farm belongs to customer, False otherwise
    """
    try:
        result = supabase.table('farms').select('id, integrator_id').eq('id', farm_id).single().execute()
        
        if not result.data:
            return False
            
        farm = result.data
        # Check if farm belongs to this integrator/customer
        return farm.get('integrator_id') == customer_id
        
    except Exception as e:
        logger.error("farm_ownership_verification_failed", farm_id=farm_id, customer_id=customer_id, error=str(e))
        return False


async def get_documents(
    supabase: Client,
    farm_id: str,
    batch_id: Optional[str] = None,
    doc_type: Optional[str] = None,
    customer_id: Optional[str] = None,
    count_only: bool = False
) -> Dict[str, Any]:
    """
    GET /api/farms/{farmId}/documents
    Returns documents grouped by doc_type, with Supabase Storage signed URLs (expire: 60s)
    If count_only=true, returns only the count without document data (optimized for badges)
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        batch_id: Optional batch ID to filter documents
        doc_type: Optional document type to filter
        customer_id: Customer ID for ownership verification
        count_only: If true, return only count without document data
        
    Returns:
        Dictionary with documents grouped by type and signed URLs, or just count if count_only=true
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Build query
    if count_only:
        # Optimized count query
        query = supabase.table('documents').select('doc_id', count='exact').eq('farm_id', farm_id).is_('deleted_at', None)
        
        if batch_id:
            query = query.eq('batch_id', batch_id)
        
        if doc_type:
            if doc_type not in VALID_DOC_TYPES:
                raise HTTPException(status_code=400, detail=f"Invalid doc_type. Must be one of: {VALID_DOC_TYPES}")
            query = query.eq('doc_type', doc_type)
        
        count_result = query.execute()
        total_count = count_result.count if count_result.count is not None else 0
        
        return {
            'total_count': total_count
        }
    
    # Full document query
    query = supabase.table('documents').select('*').eq('farm_id', farm_id).is_('deleted_at', None)
    
    if batch_id:
        query = query.eq('batch_id', batch_id)
    
    if doc_type:
        if doc_type not in VALID_DOC_TYPES:
            raise HTTPException(status_code=400, detail=f"Invalid doc_type. Must be one of: {VALID_DOC_TYPES}")
        query = query.eq('doc_type', doc_type)
    
    docs_result = query.order('created_at', ascending=False).execute()
    documents = docs_result.data if docs_result.data else []
    
    # Group documents by type and generate signed URLs
    grouped_docs = {}
    for doc_type in VALID_DOC_TYPES:
        grouped_docs[doc_type] = []
    
    for doc in documents:
        doc_type_key = doc.get('doc_type', 'other')
        if doc_type_key not in grouped_docs:
            grouped_docs[doc_type_key] = []
        
        # Generate signed URL for download (60 second expiry)
        download_url = None
        try:
            file_path = doc.get('file_path')
            if file_path:
                # Create signed URL with 60 second expiry
                signed_url_result = supabase.storage.from_('farm-documents').create_signed_url(
                    file_path, 
                    expires_in=60
                )
                if signed_url_result:
                    download_url = signed_url_result.get('signedURL')
        except Exception as e:
            logger.error("signed_url_generation_failed", doc_id=doc.get('doc_id'), error=str(e))
        
        doc_with_url = {
            **doc,
            'download_url': download_url
        }
        grouped_docs[doc_type_key].append(doc_with_url)
    
    return {
        'documents': grouped_docs,
        'total_count': len(documents)
    }


async def upload_document(
    supabase: Client,
    farm_id: str,
    file: UploadFile,
    doc_name: str,
    doc_type: str,
    batch_id: Optional[str] = None,
    document_date: Optional[str] = None,
    tags: Optional[str] = None,
    notes: Optional[str] = None,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    POST /api/farms/{farmId}/documents
    Upload a document to Supabase Storage and create database record
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        file: Uploaded file
        doc_name: Document name
        doc_type: Document type
        batch_id: Optional batch ID
        document_date: Optional document date
        tags: Optional tags as JSON string
        notes: Optional notes
        customer_id: Customer ID for ownership verification
        
    Returns:
        Created document record with download URL
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Validate document type
    if doc_type not in VALID_DOC_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid doc_type. Must be one of: {VALID_DOC_TYPES}")
    
    # Validate file extension
    file_ext = file.filename.split('.')[-1].lower() if file.filename else ''
    if file_ext not in VALID_FILE_EXTS:
        raise HTTPException(status_code=400, detail=f"Invalid file extension. Must be one of: {VALID_FILE_EXTS}")
    
    # Read file content and validate size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum of {MAX_FILE_SIZE / (1024*1024)}MB")
    
    # Reset file pointer for potential re-read
    await file.seek(0)
    
    # Get integrator_id for storage path
    integrator_id = customer_id
    
    # Generate storage path: [integrator_id]/[farmId]/[batchId ?? 'farm-level']/[docType]/[uuid].[ext]
    batch_folder = batch_id if batch_id else 'farm-level'
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    storage_path = f"{integrator_id}/{farm_id}/{batch_folder}/{doc_type}/{unique_filename}"
    
    # Upload to Supabase Storage
    try:
        upload_result = supabase.storage.from_('farm-documents').upload(
            storage_path,
            file_content,
            {'content-type': file.content_type}
        )
        logger.info("file_uploaded_to_storage", path=storage_path, size=file_size)
    except Exception as e:
        logger.error("file_upload_failed", path=storage_path, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to upload file to storage: {str(e)}")
    
    # Parse tags if provided
    tags_array = None
    if tags:
        try:
            import json
            tags_array = json.loads(tags)
            if not isinstance(tags_array, list):
                tags_array = [tags]
        except:
            tags_array = [tags]
    
    # Insert into documents table
    doc_record = {
        'farm_id': farm_id,
        'batch_id': batch_id,
        'integrator_id': integrator_id,
        'doc_name': doc_name,
        'doc_type': doc_type,
        'file_path': storage_path,
        'file_size_bytes': file_size,
        'file_ext': file_ext,
        'document_date': document_date,
        'tags': tags_array,
        'notes': notes,
        'uploaded_by': customer_id,
        'created_at': datetime.now().isoformat()
    }
    
    try:
        result = supabase.table('documents').insert(doc_record).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create document record")
        
        new_doc = result.data[0]
        logger.info("document_record_created", doc_id=new_doc['doc_id'])
        
        # Insert audit log entry
        audit_record = {
            'doc_id': new_doc['doc_id'],
            'farm_id': farm_id,
            'action': 'upload',
            'performed_by': customer_id,
            'performed_at': datetime.now().isoformat()
        }
        
        try:
            supabase.table('document_audit_log').insert(audit_record).execute()
        except Exception as e:
            logger.error("audit_log_insert_failed", doc_id=new_doc['doc_id'], error=str(e))
        
        # Generate signed URL for immediate download
        download_url = None
        try:
            signed_url_result = supabase.storage.from_('farm-documents').create_signed_url(
                storage_path, 
                expires_in=60
            )
            if signed_url_result:
                download_url = signed_url_result.get('signedURL')
        except Exception as e:
            logger.error("signed_url_generation_failed", doc_id=new_doc['doc_id'], error=str(e))
        
        return {
            **new_doc,
            'download_url': download_url
        }
        
    except Exception as e:
        logger.error("document_creation_failed", error=str(e))
        # Clean up uploaded file if DB insert fails
        try:
            supabase.storage.from_('farm-documents').remove([storage_path])
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to create document record: {str(e)}")


async def get_document(
    supabase: Client,
    farm_id: str,
    doc_id: str,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    GET /api/farms/{farmId}/documents/{docId}
    Returns document record + fresh signed download URL
    Side effect: inserts document_audit_log record (action='download')
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        doc_id: Document ID
        customer_id: Customer ID for ownership verification
        
    Returns:
        Document record with signed download URL
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Get document
    doc_result = supabase.table('documents').select('*').eq('doc_id', doc_id).eq('farm_id', farm_id).is_('deleted_at', None).single().execute()
    
    if not doc_result.data:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = doc_result.data
    
    # Generate signed URL for download (60 second expiry)
    download_url = None
    try:
        file_path = doc.get('file_path')
        if file_path:
            signed_url_result = supabase.storage.from_('farm-documents').create_signed_url(
                file_path, 
                expires_in=60
            )
            if signed_url_result:
                download_url = signed_url_result.get('signedURL')
    except Exception as e:
        logger.error("signed_url_generation_failed", doc_id=doc_id, error=str(e))
    
    # Insert audit log entry for download
    audit_record = {
        'doc_id': doc_id,
        'farm_id': farm_id,
        'action': 'download',
        'performed_by': customer_id,
        'performed_at': datetime.now().isoformat()
    }
    
    try:
        supabase.table('document_audit_log').insert(audit_record).execute()
    except Exception as e:
        logger.error("audit_log_insert_failed", doc_id=doc_id, error=str(e))
    
    return {
        **doc,
        'download_url': download_url
    }


async def update_document(
    supabase: Client,
    farm_id: str,
    doc_id: str,
    update_data: Dict[str, Any],
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    PATCH /api/farms/{farmId}/documents/{docId}
    Update document metadata
    Side effect: inserts audit log (action='rename' if doc_name changed)
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        doc_id: Document ID
        update_data: Update data (doc_name, tags, notes, document_date)
        customer_id: Customer ID for ownership verification
        
    Returns:
        Updated document record
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if document exists and belongs to this farm
    existing_doc = supabase.table('documents').select('*').eq('doc_id', doc_id).eq('farm_id', farm_id).is_('deleted_at', None).single().execute()
    
    if not existing_doc.data:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Prepare update data (only include allowed fields)
    allowed_fields = ['doc_name', 'tags', 'notes', 'document_date']
    final_update_data = {}
    
    for field in allowed_fields:
        if field in update_data:
            final_update_data[field] = update_data[field]
    
    if not final_update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    # Determine audit action
    audit_action = 'rename' if 'doc_name' in final_update_data else 'preview'
    
    # Update document
    try:
        result = supabase.table('documents').update(final_update_data).eq('doc_id', doc_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update document")
        
        updated_doc = result.data[0]
        logger.info("document_updated", doc_id=doc_id)
        
        # Insert audit log entry
        audit_record = {
            'doc_id': doc_id,
            'farm_id': farm_id,
            'action': audit_action,
            'performed_by': customer_id,
            'performed_at': datetime.now().isoformat()
        }
        
        try:
            supabase.table('document_audit_log').insert(audit_record).execute()
        except Exception as e:
            logger.error("audit_log_insert_failed", doc_id=doc_id, error=str(e))
        
        return updated_doc
        
    except Exception as e:
        logger.error("document_update_failed", doc_id=doc_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")


async def delete_document(
    supabase: Client,
    farm_id: str,
    doc_id: str,
    customer_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    DELETE /api/farms/{farmId}/documents/{docId}
    Soft delete: SET deleted_at = NOW() (does NOT delete from Storage for 30 days)
    Side effect: inserts audit log (action='delete')
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        doc_id: Document ID
        customer_id: Customer ID for ownership verification
        
    Returns:
        Deletion confirmation
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Check if document exists and belongs to this farm
    existing_doc = supabase.table('documents').select('*').eq('doc_id', doc_id).eq('farm_id', farm_id).is_('deleted_at', None).single().execute()
    
    if not existing_doc.data:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Soft delete by setting deleted_at
    try:
        result = supabase.table('documents').update({'deleted_at': datetime.now().isoformat()}).eq('doc_id', doc_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to delete document")
        
        logger.info("document_soft_deleted", doc_id=doc_id)
        
        # Insert audit log entry
        audit_record = {
            'doc_id': doc_id,
            'farm_id': farm_id,
            'action': 'delete',
            'performed_by': customer_id,
            'performed_at': datetime.now().isoformat()
        }
        
        try:
            supabase.table('document_audit_log').insert(audit_record).execute()
        except Exception as e:
            logger.error("audit_log_insert_failed", doc_id=doc_id, error=str(e))
        
        return {'deleted': True, 'doc_id': doc_id}
        
    except Exception as e:
        logger.error("document_deletion_failed", doc_id=doc_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


async def get_document_audit_log(
    supabase: Client,
    farm_id: str,
    doc_id: Optional[str] = None,
    customer_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    GET /api/farms/{farmId}/documents/audit-log?docId={docId}
    Returns audit log entries for documents
    
    Args:
        supabase: Supabase client instance
        farm_id: Farm ID
        doc_id: Optional document ID to filter audit log
        customer_id: Customer ID for ownership verification
        
    Returns:
        List of audit log entries
    """
    # Verify farm ownership
    if customer_id and not await verify_farm_ownership(supabase, farm_id, customer_id):
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
    
    # Build query
    query = supabase.table('document_audit_log').select('*').eq('farm_id', farm_id)
    
    if doc_id:
        query = query.eq('doc_id', doc_id)
    
    query = query.order('performed_at', ascending=False)
    
    result = query.execute()
    audit_logs = result.data if result.data else []
    
    return audit_logs
