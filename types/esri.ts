export type EsriField = {
  name: string;
  type: string;
  alias: string;
  length?: number;
  domain?: any;
}

export type EsriIndex = {
  name: string;
  fields: string;
  isAscending: boolean;
  isUnique: boolean;
  description: string;
}

export type EsriFeature = {
  attributes: any;
  geometry?: any;
}

export type EsriSpatialReference = {
  wkid: number;
  latestWkid: number;
  xyTolerance?: number;
  zTolerance?: number;
  mTolerance?: number;
  falseX?: number;
  falseY?: number;
  xyUnits?: number;
  falseZ?: number;
  zUnits?: number;
  falseM?: number;
  mUnits?: number;
}

export type EsriLayer = {
  displayFieldName: string;
  fieldAliases: any;
  geometryType: string;
  spatialReference: EsriSpatialReference;
  fields: EsriField[];
  features: EsriFeature[];
  exceededTransferLimit: boolean;
}

export type EsriColor = [
  number, number, number, number
]

export type EsriFont = {
  family: string;
  size: number;
  style: string;
  weight: string;
  decoration: string;
}

export type EsriSymbol = {
  type: string;
  color: EsriColor;
  backgroundColor?: EsriColor;
  borderLineColor?: EsriColor;
  borderLineSize?: number;
  verticalAlignment: string;
  horizontalAlignment: string;
  rightToLeft: boolean;
  angle: number;
  xoffset: number;
  yoffset: number;
  kerning: boolean;
  haloColor: EsriColor;
  haloSize: number;
  font: EsriFont;
}

export type EsriLabelInfo = {
  labelExpressionInfo: {
    expression: string;
  };
  labelPlacement: string;
  multiPart: string;
  allowOverrun: boolean;
  deconflictionStrategy: string;
  repeatLabel: boolean;
  allowOverlapOfFeatureBoundary: string;
  stackLabel: boolean;
  stackRowLength: number;
  stackAlignment: string;
  removeDuplicates: string;
  where: string;
  useCodedValues: boolean;
  maxScale: number;
  minScale: number;
  name: string;
  priority: number;
  symbol: EsriSymbol;
}

export type EsriLayerInfo = {
  currentVersion: number;
  cimVersion: string;
  id: number;
  name: string;
  type: string;
  description: string;
  geometryType: string;
  sourceSpatialReference: EsriSpatialReference;
  copyrightText: string;
  parentLayer?: any;
  subLayers: any[];
  minScale: number;
  maxScale: number;
  referenceScale: number;
  drawingInfo: {
    renderer: {
      type: string;
      symbol: EsriSymbol;
    }
    scaleSymbols: boolean;
    transparency: number;
    labelingInfo: EsriLabelInfo[];
  };
  defaultVisibility: boolean;
  extent: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: EsriSpatialReference;
  }
  hasAttachments: boolean;
  htmlPopupType: string;
  displayField: string;
  typeIdField?: string;
  subtypeFieldName?: string;
  subtypeField?: string;
  defaultSubtypeCode?: string;
  fields: EsriField[];
  geometryField: EsriField;
  indexes: EsriIndex[];
  subTypes: any[];
  relationships: any[];
  canModifyLayer: boolean;
  canScaleSymbols: boolean;
  hasLabels: boolean;
  capabilities: string;
  maxRecordCount: number;
  supportsStatistics: boolean;
  supportsAdvancedQueries: boolean;
  supportedQueryFormats: string;
  isDataVersioned: boolean;
  ownershipBasedAccessControlForFeatures: {
    allowOthersToQuery: boolean;
  }
  useStandardizedQueries: boolean;
  advancedQueryCapabilities: {
    useStandardizedQueries: boolean;
    supportsStatistics: boolean;
    supportsHavingClause: boolean;
    supportsOrderBy: boolean;
    supportsDistinct: boolean;
    supportsCountDistinct: boolean;
    supportsPagination: boolean;
    supportsTrueCurve: boolean;
    supportsQueryWithDatumTransformation: boolean;
    supportsReturningQueryExtent: boolean;
    supportsQueryWithDistance: boolean;
    supportsSqlExpression: boolean;
  };
  supportsDatumTransformation: boolean;
  dateFieldsTimeReference?: any;
  hasMetadata: boolean;
  isDataArchived: boolean;
  archivingInfo: {
    supportsQueryWithHistoricMoment: boolean;
    startArchivingMoment: number;
  }
  supportsCoordinatesQuantization: boolean;
  supportsDynamicLegends: boolean;
}
