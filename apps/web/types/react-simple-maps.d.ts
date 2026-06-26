declare module 'react-simple-maps' {
  import { ReactNode, SVGProps } from 'react';

  export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    children?: ReactNode;
    projection?: string;
    projectionConfig?: any;
    width?: number;
    height?: number;
  }

  export interface ZoomableGroupProps extends SVGProps<SVGGElement> {
    children?: ReactNode;
    zoom?: number;
    center?: [number, number];
  }

  export interface GeographiesProps {
    children: (props: { geographies: any[] }) => ReactNode;
    geography: any;
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: any;
  }

  export interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
    children?: ReactNode;
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element;
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
  export function Geographies(props: GeographiesProps): JSX.Element;
  export function Geography(props: GeographyProps): JSX.Element;
  export function Marker(props: MarkerProps): JSX.Element;
}
