import { ISkill } from "./ISkill";

export interface IEmployee {
    id: null;
    fullname: string;
    email: string;
    phone?: null;
    contactPreference: string;
    skills: ISkill[];
}