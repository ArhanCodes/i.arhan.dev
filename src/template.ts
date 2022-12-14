/**
 * @file template.ts 
 */
type stringObject = { [key: string]: string };
import fs from 'fs';
import Config from './Config';
import { toSize } from './util';

export default class Template {
    public readonly fields: stringObject;
    public constructor(public readonly file: string, fields?: stringObject) {
        this.fields = {
            STATIC_MAX_FILE_SIZE: toSize(Config.MAX_FILE_MB * 1000000),
            STATIC_SLOGAN: Config.SLOGAN,
            STATIC_DOMAIN_NAME: Config.DOMAIN_NAME,
            ...fields
        };
    }
    public render(): string {
        let template = fs.readFileSync(this.file, 'utf8');
        for (let key in this.fields) {
            template = template.replace(new RegExp(`{{${key}}}`, 'g'), this.fields[key]);
        }
        return template;
    }
}
