// import { console } from '../Logging/console';

export interface FieldMap<T> {
  from?: string;
  to: keyof T;
  pgPrefix?: string;
  isRequired?: boolean;
  as?: string;
  mapTransformFunc?: (row: any) => any;
  parseFunc?: (value: any) => any;
}

export interface FieldMapperDescriptor<T> {
  mapperFunc: (row: any) => T;
  mapperName: string;
  fieldMap: FieldMap<T>[];
}

export const createFieldMapper = <T>(mapperName: string, fieldMap: FieldMap<T>[]) => (row: any) =>
  fieldMap.reduce((mappedObject: T, mapItem: FieldMap<T>) => {
    if (!row) {
      return mappedObject;
    }

    if (mapItem.mapTransformFunc) {
      return { ...mappedObject, [mapItem.to]: mapItem.mapTransformFunc(row) };
    }

    const columnName = mapItem.as ? mapItem.as.toLocaleLowerCase() : mapItem.from.toLocaleLowerCase();

    if (mapItem.isRequired && !row[columnName]) {
      console.warn(`${mapperName}: field ${columnName} must be present on a row ${JSON.stringify(row)}`);
    }

    return {
      ...mappedObject,
      [mapItem.to]: mapItem.parseFunc ? mapItem.parseFunc(row[columnName]) : row[columnName],
    };
  }, null);

export const fieldMapper = <T>(mapperName: string, fieldMap: FieldMap<T>[]): FieldMapperDescriptor<T> => ({
  fieldMap,
  mapperName,
  mapperFunc: createFieldMapper<T>(mapperName, fieldMap),
});

export const mapField = <T>(
  from: string,
  to: keyof T,
  isRequired: boolean = false,
  pgPrefix: string = '',
  as: string = ''
): FieldMap<T> => ({
  from,
  to,
  isRequired,
  pgPrefix,
  as,
});

export const mapNumberField = <T>(
  from: string,
  to: keyof T,
  isRequired: boolean = false,
  pgPrefix: string = '',
  as: string = ''
): FieldMap<T> => ({
  from,
  to,
  isRequired,
  pgPrefix,
  as,
  parseFunc: value => parseInt(value, 10),
});

export const mapFloatField = <T>(
  from: string,
  to: keyof T,
  isRequired: boolean = false,
  pgPrefix: string = '',
  as: string = ''
): FieldMap<T> => ({
  from,
  to,
  isRequired,
  pgPrefix,
  as,
  parseFunc: value => parseFloat(value),
});

export const mapTransform = <T>(mapTransformFunc: (row: any) => any, to: keyof T): FieldMap<T> => ({
  to,
  mapTransformFunc,
});

export const mapTransformPg = <T>(
  from: string,
  mapTransformFunc: (val: any) => any,
  to: keyof T,
  pgPrefix?: string
): FieldMap<T> => ({
  pgPrefix,
  from,
  to,
  mapTransformFunc: row => mapTransformFunc(row[pgPrefix ? `${pgPrefix}.${from}` : from]),
});
