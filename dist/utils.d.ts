import { API, FileInfo, Options } from 'jscodeshift';
export declare function applyMultipleTransforms<Ctx>(file: FileInfo, api: API, transforms: ((props: {
    file: FileInfo;
    api: API;
    options: Options;
    context: Ctx;
}) => string)[], options: Options, context: Ctx): string;
