export enum PublishStatus {
    Public = 0,
    Private = 1,
    Pending = 2,
}

export const PublishStatusText: Record<PublishStatus, string> = {
    [PublishStatus.Public]: "Public",
    [PublishStatus.Private]: "Private",
    [PublishStatus.Pending]: "Pending",
};