

export interface Receipt {
    readonly type: string,
    readonly receipt: string,
    readonly userId: string,
    readonly validateData: string,
    readonly purchaseData: string,
    readonly isProcessed: boolean
    readonly createTime: number
    readonly updateTime: number
}
