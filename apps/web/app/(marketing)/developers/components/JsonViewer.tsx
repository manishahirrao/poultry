// FlockIQ — JsonViewer Component
// File: apps/web/app/(marketing)/developers/components/JsonViewer.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-016
// Requirements: REQ-WEB-007 §W7.3
// Design Reference: Design Spec §7

'use client';

import { useState } from 'react';
import { JsonView as JsonViewLib } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface JsonViewerProps {
  data: any;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-[#0D1117] p-4">
      <JsonViewLib data={data} />
    </div>
  );
}
