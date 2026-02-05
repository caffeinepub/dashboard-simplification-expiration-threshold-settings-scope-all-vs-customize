import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
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
    fileReference : Storage.ExternalBlob;
    semanticVersion : Text;
    uploader : Principal;
    associatedBenches : [Text];
    tags : [Tag];
    documentVersion : ?Text;
  };

  type TestBench = {
    id : Text;
    name : Text;
    agileCode : Text;
    plmAgileUrl : Text;
    description : Text;
    photo : Storage.ExternalBlob;
    tags : [Tag];
    documents : [(Text, Version)];
    creator : ?Principal;
  };

  type Component = {
    componentName : Text;
    validityDate : Text;
    expirationDate : Text;
    status : Status;
  };

  type HistoryEntry = {
    timestamp : Time.Time;
    action : Text;
    user : Principal;
    details : Text;
  };

  // Old Profile
  type OldUserProfile = {
    userId : Text;
    email : Text;
    name : Text;
    expirationThresholdMode : ExpirationThresholdMode;
    thresholdAllBenches : Nat;
    thresholdCustomizedBenches : [(Text, Nat)];
    dashboardSectionsOrdered : [Text];
  };

  type ProfilePicture = {
    #avatar : Text;
    #custom : Storage.ExternalBlob;
  };

  // New Profile
  type NewUserProfile = {
    userId : Text;
    email : Text;
    name : Text;
    entity : Text;
    expirationThresholdMode : ExpirationThresholdMode;
    thresholdAllBenches : Nat;
    thresholdCustomizedBenches : [(Text, Nat)];
    dashboardSectionsOrdered : [Text];
    profilePicture : ProfilePicture;
    lastSeen : ?Int;
  };

  type OldActor = {
    testBenchMap : Map.Map<Text, TestBench>;
    documentMap : Map.Map<Text, Document>;
    componentMap : Map.Map<Text, [Component]>;
    historyMap : Map.Map<Text, [HistoryEntry]>;
    userProfileMap : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    testBenchMap : Map.Map<Text, TestBench>;
    documentMap : Map.Map<Text, Document>;
    componentMap : Map.Map<Text, [Component]>;
    historyMap : Map.Map<Text, [HistoryEntry]>;
    userProfileMap : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfileMap = old.userProfileMap.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        {
          userId = oldProfile.userId;
          email = oldProfile.email;
          name = oldProfile.name;
          entity = "Unknown";
          expirationThresholdMode = oldProfile.expirationThresholdMode;
          thresholdAllBenches = oldProfile.thresholdAllBenches;
          thresholdCustomizedBenches = oldProfile.thresholdCustomizedBenches;
          dashboardSectionsOrdered = oldProfile.dashboardSectionsOrdered;
          profilePicture = #avatar("default");
          lastSeen = null;
        };
      }
    );
    {
      testBenchMap = old.testBenchMap;
      documentMap = old.documentMap;
      componentMap = old.componentMap;
      historyMap = old.historyMap;
      userProfileMap = newUserProfileMap;
    };
  };
};
