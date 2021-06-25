import { API, FileInfo, Options } from 'jscodeshift';

export type MultiTransformParams<Ctx = null> = { file: FileInfo; api: API; options: Options; context: Ctx };
