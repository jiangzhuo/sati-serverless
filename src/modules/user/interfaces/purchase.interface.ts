
export interface Purchase {
    readonly productId: string;
    readonly bundleId: string;
    readonly type: string;
    readonly price: number;
    readonly createTime: number;
    readonly updateTime: number;
}
