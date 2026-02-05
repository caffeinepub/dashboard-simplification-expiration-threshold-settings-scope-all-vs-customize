import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ExpiredComponentSummary {
    aml: string;
    status: Status;
    component: Component;
    dueDate: string;
    currentDate: string;
    benchSerialNumber: string;
    associatedBench: string;
}
export type Time = bigint;
export interface HistoryEntry {
    action: string;
    user: Principal;
    timestamp: Time;
    details: string;
}
export interface Document {
    id: string;
    documentVersion?: string;
    tags: Array<Tag>;
    version: Version;
    associatedBenches: Array<string>;
    category: string;
    uploader: Principal;
    productDisplayName: string;
    semanticVersion: string;
    fileReference: ExternalBlob;
}
export interface Component {
    status: Status;
    validityDate: string;
    expirationDate: string;
    associatedBenchId: string;
    manufacturerReference: string;
    componentName: string;
}
export type ProfilePicture = {
    __kind__: "custom";
    custom: ExternalBlob;
} | {
    __kind__: "avatar";
    avatar: string;
};
export interface TestBench {
    id: string;
    plmAgileUrl: string;
    creator?: Principal;
    documents: Array<[string, Version]>;
    decawebUrl: string;
    name: string;
    tags: Array<Tag>;
    description: string;
    photoUrl?: string;
    agileCode: string;
    serialNumber: string;
    photo: ExternalBlob;
}
export interface Tag {
    tagName: string;
}
export type Version = bigint;
export interface PublicUserInfo {
    name: string;
    profilePicture: ProfilePicture;
}
export interface UserProfile {
    entity: string;
    thresholdCustomizedBenches: Array<[string, bigint]>;
    userId: string;
    name: string;
    email: string;
    thresholdAllBenches: bigint;
    expirationThresholdMode: ExpirationThresholdMode;
    profilePicture: ProfilePicture;
    lastSeen?: bigint;
    dashboardSectionsOrdered: Array<string>;
}
export enum ExpirationThresholdMode {
    allBenches = "allBenches",
    customizedBenches = "customizedBenches"
}
export enum Status {
    ok = "ok",
    expiringSoon = "expiringSoon",
    expired = "expired"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    associateDocumentToBench(documentId: string, benchId: string): Promise<void>;
    createDocument(id: string, productDisplayName: string, version: Version, category: string, fileReference: ExternalBlob, semanticVersion: string, tags: Array<Tag>, documentVersion: string | null): Promise<void>;
    createTestBench(id: string, name: string, serialNumber: string, agileCode: string, plmAgileUrl: string, decawebUrl: string, description: string, photo: ExternalBlob, photoUrl: string | null, tags: Array<Tag>): Promise<void>;
    documentExists(documentId: string): Promise<boolean>;
    filterDocumentsByTags(tags: Array<Tag>): Promise<Array<Document>>;
    findExpiringDocuments(daysRemaining: bigint | null): Promise<Array<Document>>;
    getAllEntities(): Promise<Array<string>>;
    getAllTestBenches(): Promise<Array<TestBench>>;
    getAllowedEmailDomain(): Promise<string>;
    getBenchHistory(benchId: string): Promise<Array<HistoryEntry>>;
    getBenchName(benchId: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComponents(benchId: string): Promise<Array<Component>>;
    getExpiredComponentsSummary(): Promise<Array<ExpiredComponentSummary>>;
    getProfilePicture(userId: Principal): Promise<ProfilePicture | null>;
    getPublicUserInfo(user: Principal): Promise<PublicUserInfo | null>;
    getTestBench(benchId: string): Promise<TestBench | null>;
    getUniqueEntities(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsersByEntity(entity: string): Promise<Array<UserProfile>>;
    isCallerAdmin(): Promise<boolean>;
    isOnline(userId: Principal): Promise<boolean>;
    removeDocumentFromBench(documentId: string, benchId: string): Promise<void>;
    removeTestBench(benchId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAllowedEmailDomain(newDomain: string): Promise<void>;
    setComponents(benchId: string, components: Array<Component>): Promise<void>;
    setProfilePicture(profilePicture: ProfilePicture): Promise<void>;
    updateDashboardSectionsOrder(sections: Array<string>): Promise<void>;
    updateExpirationPreferences(mode: ExpirationThresholdMode, thresholdAll: bigint, thresholdCustom: Array<[string, bigint]>): Promise<void>;
    updateLastSeen(): Promise<void>;
    updateTestBench(benchId: string, name: string, serialNumber: string, agileCode: string, plmAgileUrl: string, decawebUrl: string, description: string, photo: ExternalBlob, photoUrl: string | null, tags: Array<Tag>): Promise<void>;
    uploadProfilePicture(picture: ExternalBlob): Promise<ExternalBlob>;
}
