import { API, FileInfo, Options } from 'jscodeshift';
export interface Context {
    destructuredVariables: Set<string>;
}
export default function transform(file: FileInfo, api: API, options: Options): string;
