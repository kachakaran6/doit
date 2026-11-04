export declare class PasswordService {
    hash(password: string): Promise<string>;
    verify(hash: string, plain: string): Promise<boolean>;
}
