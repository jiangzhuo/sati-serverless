
export interface Account {
    readonly userId: string;
    readonly value: number;
    readonly afterBalance: number;
    readonly type: string;
    readonly createTime: number;
    readonly extraInfo: string;
}
