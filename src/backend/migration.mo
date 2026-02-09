import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type Version = Nat;

  type ExpirationThresholdMode = {
    #allBenches;
    #customizedBenches;
  };

  type Status = {
    #ok;
    #expired;
    #expiringSoon;
  };

  type Tag = {
    tagName : Text;
  };

  type Document = {
    id : Text;
    productDisplayName : Text;
    version : Version;
    category : Text;
    fileReference : Blob;
    semanticVersion : Text;
    uploader : Principal;
    associatedBenches : [Text];
    tags : [Tag];
    documentVersion : ?Text;
  };

  type TestBench = {
    id : Text;
    name : Text;
    serialNumber : Text;
    agileCode : Text;
    plmAgileUrl : Text;
    decawebUrl : Text;
    description : Text;
    photo : Blob;
    photoUrl : ?Text;
    tags : [Tag];
    documents : [(Text, Version)];
    creator : ?Principal;
  };

  type Component = {
    componentName : Text;
    manufacturerReference : Text;
    validityDate : Text;
    expirationDate : Text;
    status : Status;
    associatedBenchId : Text;
  };

  type HistoryEntry = {
    timestamp : Time.Time;
    action : Text;
    user : Principal;
    details : Text;
  };

  type ProfilePicture = {
    #avatar : Text;
    #custom : Blob;
  };

  type UserProfile = {
    userId : Text;
    email : Text;
    username : Text;
    bio : Text;
    avatarUrl : Text;
    entity : Text;
    expirationThresholdMode : ExpirationThresholdMode;
    thresholdAllBenches : Nat;
    thresholdCustomizedBenches : [(Text, Nat)];
    dashboardSectionsOrdered : [Text];
    profilePicture : ProfilePicture;
    languageTag : Text;
    lastSeen : ?Int;
  };

  type Actor = {
    allowedEmailDomain : Text;
    userProfileMap : Map.Map<Principal, UserProfile>;
    entitiesSet : Set.Set<Text>;
    documentMap : Map.Map<Text, Document>;
    testBenchMap : Map.Map<Text, TestBench>;
    componentMap : Map.Map<Text, [Component]>;
    historyMap : Map.Map<Text, [HistoryEntry]>;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
