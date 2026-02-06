import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Time "mo:core/Time";

module {
  type Version = Nat;
  type ExpirationThresholdMode = { #allBenches; #customizedBenches };
  type Status = { #ok; #expired; #expiringSoon };
  type Tag = { tagName : Text };
  type ProfilePicture = { #avatar : Text; #custom : Storage.ExternalBlob };

  type OldDocument = {
    id : Text;
    productDisplayName : Text;
    version : Version;
    category : Text;
    fileReference : Storage.ExternalBlob;
    semanticVersion : Text;
    uploader : Principal;
    associatedBenches : [Text];
    tags : [Tag];
    documentVersion : ?Text;
  };

  type OldTestBench = {
    id : Text;
    name : Text;
    serialNumber : Text;
    agileCode : Text;
    plmAgileUrl : Text;
    decawebUrl : Text;
    description : Text;
    photo : Storage.ExternalBlob;
    photoUrl : ?Text;
    tags : [Tag];
    documents : [(Text, Version)];
    creator : ?Principal;
  };

  type OldComponent = {
    componentName : Text;
    manufacturerReference : Text;
    validityDate : Text;
    expirationDate : Text;
    status : Status;
    associatedBenchId : Text;
  };

  type HistoryEntry = { timestamp : Time.Time; action : Text; user : Principal; details : Text };
  type PublicUserInfo = { name : Text; profilePicture : ProfilePicture };

  type OldUserProfile = {
    userId : Text;
    email : Text;
    name : Text;
    entity : Text;
    expirationThresholdMode : ExpirationThresholdMode;
    thresholdAllBenches : Nat;
    thresholdCustomizedBenches : [(Text, Nat)];
    dashboardSectionsOrdered : [Text];
    profilePicture : ProfilePicture;
    languageTag : Text;
    lastSeen : ?Int;
  };

  type NewUserProfile = {
    userId : Text;
    email : Text;
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : Text;
    name : Text;
    entity : Text;
    expirationThresholdMode : ExpirationThresholdMode;
    thresholdAllBenches : Nat;
    thresholdCustomizedBenches : [(Text, Nat)];
    dashboardSectionsOrdered : [Text];
    profilePicture : ProfilePicture;
    languageTag : Text;
    lastSeen : ?Int;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    testBenchMap : Map.Map<Text, OldTestBench>;
    documentMap : Map.Map<Text, OldDocument>;
    componentMap : Map.Map<Text, [OldComponent]>;
    historyMap : Map.Map<Text, [HistoryEntry]>;
    userProfileMap : Map.Map<Principal, OldUserProfile>;
    entitiesSet : Set.Set<Text>;
    allowedEmailDomain : Text;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    testBenchMap : Map.Map<Text, OldTestBench>;
    documentMap : Map.Map<Text, OldDocument>;
    componentMap : Map.Map<Text, [OldComponent]>;
    historyMap : Map.Map<Text, [HistoryEntry]>;
    userProfileMap : Map.Map<Principal, NewUserProfile>;
    entitiesSet : Set.Set<Text>;
    allowedEmailDomain : Text;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfileMap = old.userProfileMap.map<Principal, OldUserProfile, NewUserProfile>(
      func(_k, v) {
        {
          userId = v.userId;
          email = v.email;
          username = v.name; // Default username to name initially
          displayName = v.name; // Default displayName to name
          bio = "";
          avatarUrl = "";
          name = v.name;
          entity = v.entity;
          expirationThresholdMode = v.expirationThresholdMode;
          thresholdAllBenches = v.thresholdAllBenches;
          thresholdCustomizedBenches = v.thresholdCustomizedBenches;
          dashboardSectionsOrdered = v.dashboardSectionsOrdered;
          profilePicture = v.profilePicture;
          languageTag = v.languageTag;
          lastSeen = v.lastSeen;
        };
      }
    );
    {
      old with
      userProfileMap = newUserProfileMap;
    };
  };
};

