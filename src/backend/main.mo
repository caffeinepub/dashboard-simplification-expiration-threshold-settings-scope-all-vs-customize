import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Set "mo:core/Set";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

// Use migration
(with migration = Migration.run)
actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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

  module Tag {
    public func compare(tag1 : Tag, tag2 : Tag) : Order.Order {
      Text.compare(tag1.tagName, tag2.tagName);
    };
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

  module Document {
    public func compare(doc1 : Document, doc2 : Document) : Order.Order {
      Text.compare(doc1.id, doc2.id);
    };
  };

  type TestBench = {
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

  module TestBench {
    public func compare(bench1 : TestBench, bench2 : TestBench) : Order.Order {
      Text.compare(bench1.id, bench2.id);
    };
  };

  type Component = {
    componentName : Text;
    manufacturerReference : Text;
    validityDate : Text;
    expirationDate : Text;
    status : Status;
    associatedBenchId : Text;
  };

  module Component {
    public func compare(component1 : Component, component2 : Component) : Order.Order {
      Text.compare(component1.componentName, component2.componentName);
    };
  };

  type HistoryEntry = {
    timestamp : Time.Time;
    action : Text;
    user : Principal;
    details : Text;
  };

  type ProfilePicture = {
    #avatar : Text;
    #custom : Storage.ExternalBlob;
  };

  type PublicUserInfo = {
    name : Text;
    profilePicture : ProfilePicture;
  };

  type UserProfile = {
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

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.userId, profile2.userId);
    };
  };

  let testBenchMap = Map.empty<Text, TestBench>();
  let documentMap = Map.empty<Text, Document>();
  let componentMap = Map.empty<Text, [Component]>();
  let historyMap = Map.empty<Text, [HistoryEntry]>();
  let userProfileMap = Map.empty<Principal, UserProfile>();
  let entitiesSet = Set.empty<Text>();
  var allowedEmailDomain = "safrangroup.com";

  public query ({ caller }) func getAllTestBenches() : async [TestBench] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access test benches");
    };
    testBenchMap.values().toArray().sort();
  };

  public query ({ caller }) func getBenchName(benchId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access test benches");
    };
    switch (testBenchMap.get(benchId)) {
      case (null) { Runtime.trap("Bench does not exist") };
      case (?bench) { bench.name };
    };
  };

  public query ({ caller }) func documentExists(documentId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access documents");
    };
    documentMap.containsKey(documentId);
  };

  public query ({ caller }) func filterDocumentsByTags(tags : [Tag]) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access documents");
    };
    var documents = documentMap.values().toArray();
    for (tag in tags.values()) {
      documents := documents.filter(
        func(doc) {
          doc.tags.any(
            func(t) {
              tag.tagName == t.tagName;
            }
          );
        }
      );
    };
    documents.sort();
  };

  public query ({ caller }) func findExpiringDocuments(daysRemaining : ?Nat) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access documents");
    };

    let filteredDocs = documentMap.values().toArray().filter(
      func(doc) {
        switch (daysRemaining) {
          case (null) { true };
          case (?days) { days <= 30 };
        };
      }
    );
    filteredDocs;
  };

  public shared ({ caller }) func uploadProfilePicture(picture : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };
    picture;
  };

  public shared ({ caller }) func setProfilePicture(profilePicture : ProfilePicture) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set profile picture");
    };

    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      userId = currentProfile.userId;
      email = currentProfile.email;
      username = currentProfile.username;
      displayName = currentProfile.displayName;
      bio = currentProfile.bio;
      avatarUrl = currentProfile.avatarUrl;
      name = currentProfile.name;
      entity = currentProfile.entity;
      expirationThresholdMode = currentProfile.expirationThresholdMode;
      thresholdAllBenches = currentProfile.thresholdAllBenches;
      thresholdCustomizedBenches = currentProfile.thresholdCustomizedBenches;
      dashboardSectionsOrdered = currentProfile.dashboardSectionsOrdered;
      profilePicture;
      languageTag = currentProfile.languageTag;
      lastSeen = currentProfile.lastSeen;
    };

    userProfileMap.add(caller, updatedProfile);
  };

  public query ({ caller }) func getProfilePicture(userId : Principal) : async ?ProfilePicture {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profile pictures");
    };
    switch (userProfileMap.get(userId)) {
      case (null) { null };
      case (?profile) { ?profile.profilePicture };
    };
  };

  public shared ({ caller }) func setLanguageTag(languageTag : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set language preference");
    };

    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      userId = currentProfile.userId;
      email = currentProfile.email;
      username = currentProfile.username;
      displayName = currentProfile.displayName;
      bio = currentProfile.bio;
      avatarUrl = currentProfile.avatarUrl;
      name = currentProfile.name;
      entity = currentProfile.entity;
      expirationThresholdMode = currentProfile.expirationThresholdMode;
      thresholdAllBenches = currentProfile.thresholdAllBenches;
      thresholdCustomizedBenches = currentProfile.thresholdCustomizedBenches;
      dashboardSectionsOrdered = currentProfile.dashboardSectionsOrdered;
      profilePicture = currentProfile.profilePicture;
      languageTag;
      lastSeen = currentProfile.lastSeen;
    };

    userProfileMap.add(caller, updatedProfile);
  };

  public query ({ caller }) func getLanguageTag() : async Text {
    // No authorization check - accessible to all users including guests
    // This allows the frontend to get language preference before authentication
    switch (userProfileMap.get(caller)) {
      case (null) {
        "en-US"; // Default to English if no profile exists
      };
      case (?profile) { profile.languageTag };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (userProfileMap.get(caller)) {
      case (null) {
        // Default dashboard structure
        let defaultSections = [
          "dashboardGeneralStatsChart",
          "dashboardTotalBenchesChart",
          "dashboardExpiredComponentsChart",
          "dashboardThresholdBreakdownChart",
          "dashboardExpiringSoonChart",
          "dashboardDrillDownChart",
          "statistics",
          "documents",
          "benches",
          "quickActions",
        ];
        ?{
          userId = caller.toText();
          email = "";
          username = "";
          displayName = "";
          bio = "";
          avatarUrl = "";
          name = "";
          entity = "";
          expirationThresholdMode = #allBenches;
          thresholdAllBenches = 30;
          thresholdCustomizedBenches = [];
          dashboardSectionsOrdered = defaultSections;
          profilePicture = #avatar("default");
          languageTag = "en-US";
          lastSeen = null;
        };
      };
      case (profile) { profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfileMap.get(user);
  };

  func hasAllowedDomain(email : Text) : Bool {
    email.endsWith(#text("@" # allowedEmailDomain));
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (not hasAllowedDomain(profile.email)) {
      Runtime.trap("Invalid email domain. Only " # allowedEmailDomain # " is allowed.");
    };

    entitiesSet.add(profile.entity);
    userProfileMap.add(caller, profile);
  };

  public query ({ caller }) func getUniqueEntities() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view entities");
    };
    entitiesSet.toArray();
  };

  public shared ({ caller }) func setAllowedEmailDomain(newDomain : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set allowed email domain");
    };
    allowedEmailDomain := newDomain;
  };

  public query ({ caller }) func getAllowedEmailDomain() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view allowed email domain");
    };
    allowedEmailDomain;
  };

  public query ({ caller }) func isOnline(userId : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check online status");
    };

    let currentProfile = switch (userProfileMap.get(userId)) {
      case (null) { return false };
      case (?profile) { profile };
    };

    switch (currentProfile.lastSeen) {
      case (null) { false };
      case (?lastSeen) {
        let onlineThreshold = 5 * 60 * 1_000_000_000; // 5 minutes in nanoseconds
        Time.now() - lastSeen <= onlineThreshold;
      };
    };
  };

  public shared ({ caller }) func updateLastSeen() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update online status");
    };

    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) { return };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      userId = currentProfile.userId;
      email = currentProfile.email;
      username = currentProfile.username;
      displayName = currentProfile.displayName;
      bio = currentProfile.bio;
      avatarUrl = currentProfile.avatarUrl;
      name = currentProfile.name;
      entity = currentProfile.entity;
      expirationThresholdMode = currentProfile.expirationThresholdMode;
      thresholdAllBenches = currentProfile.thresholdAllBenches;
      thresholdCustomizedBenches = currentProfile.thresholdCustomizedBenches;
      dashboardSectionsOrdered = currentProfile.dashboardSectionsOrdered;
      profilePicture = currentProfile.profilePicture;
      languageTag = currentProfile.languageTag;
      lastSeen = ?Time.now();
    };

    userProfileMap.add(caller, updatedProfile);
  };

  public query ({ caller }) func getUsersByEntity(entity : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view users by entity");
    };

    let result = List.empty<UserProfile>();
    for ((_, profile) in userProfileMap.entries()) {
      if (profile.entity == entity) {
        result.add(profile);
      };
    };
    result.toArray();
  };

  // Deprecated for backward compatibility only - can be removed in the future
  public query ({ caller }) func getAllEntities() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all entities");
    };

    let entities = List.empty<Text>();
    for ((_, profile) in userProfileMap.entries()) {
      let exists = entities.any(func(e) { e == profile.entity });
      if (not exists) {
        entities.add(profile.entity);
      };
    };
    entities.toArray();
  };

  public shared ({ caller }) func updateExpirationPreferences(
    mode : ExpirationThresholdMode,
    thresholdAll : Nat,
    thresholdCustom : [(Text, Nat)],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expiration preferences");
    };

    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      userId = currentProfile.userId;
      email = currentProfile.email;
      username = currentProfile.username;
      displayName = currentProfile.displayName;
      bio = currentProfile.bio;
      avatarUrl = currentProfile.avatarUrl;
      name = currentProfile.name;
      entity = currentProfile.entity;
      expirationThresholdMode = mode;
      thresholdAllBenches = thresholdAll;
      thresholdCustomizedBenches = thresholdCustom;
      dashboardSectionsOrdered = currentProfile.dashboardSectionsOrdered;
      profilePicture = currentProfile.profilePicture;
      languageTag = currentProfile.languageTag;
      lastSeen = currentProfile.lastSeen;
    };

    userProfileMap.add(caller, updatedProfile);
  };

  public shared ({ caller }) func updateDashboardSectionsOrder(sections : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update dashboard sections");
    };

    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      userId = currentProfile.userId;
      email = currentProfile.email;
      username = currentProfile.username;
      displayName = currentProfile.displayName;
      bio = currentProfile.bio;
      avatarUrl = currentProfile.avatarUrl;
      name = currentProfile.name;
      entity = currentProfile.entity;
      expirationThresholdMode = currentProfile.expirationThresholdMode;
      thresholdAllBenches = currentProfile.thresholdAllBenches;
      thresholdCustomizedBenches = currentProfile.thresholdCustomizedBenches;
      dashboardSectionsOrdered = sections;
      profilePicture = currentProfile.profilePicture;
      languageTag = currentProfile.languageTag;
      lastSeen = currentProfile.lastSeen;
    };

    userProfileMap.add(caller, updatedProfile);
  };

  public shared ({ caller }) func createTestBench(
    id : Text,
    name : Text,
    serialNumber : Text,
    agileCode : Text,
    plmAgileUrl : Text,
    decawebUrl : Text,
    description : Text,
    photo : Storage.ExternalBlob,
    photoUrl : ?Text,
    tags : [Tag],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create test benches");
    };
    if (testBenchMap.containsKey(id)) {
      Runtime.trap("Test bench already exists!");
    };

    let newBench : TestBench = {
      id;
      name;
      serialNumber;
      agileCode;
      plmAgileUrl;
      decawebUrl;
      description;
      photo;
      photoUrl;
      tags;
      documents = [];
      creator = ?caller;
    };
    testBenchMap.add(id, newBench);

    let historyEntry : HistoryEntry = {
      timestamp = Time.now();
      action = "Bench created";
      user = caller;
      details = "Created bench: " # name;
    };
    historyMap.add(id, [historyEntry]);
  };

  public shared ({ caller }) func updateTestBench(
    benchId : Text,
    name : Text,
    serialNumber : Text,
    agileCode : Text,
    plmAgileUrl : Text,
    decawebUrl : Text,
    description : Text,
    photo : Storage.ExternalBlob,
    photoUrl : ?Text,
    tags : [Tag],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update test benches");
    };

    let bench = switch (testBenchMap.get(benchId)) {
      case (null) { Runtime.trap("Test bench does not exist!") };
      case (?b) { b };
    };

    let updatedBench : TestBench = {
      id = bench.id;
      name;
      serialNumber;
      agileCode;
      plmAgileUrl;
      decawebUrl;
      description;
      photo;
      photoUrl;
      tags;
      documents = bench.documents;
      creator = bench.creator;
    };
    testBenchMap.add(benchId, updatedBench);

    let historyEntry : HistoryEntry = {
      timestamp = Time.now();
      action = "Bench metadata updated";
      user = caller;
      details = "Updated bench metadata";
    };
    addHistoryEntry(benchId, historyEntry);
  };

  public shared ({ caller }) func removeTestBench(benchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove test benches");
    };

    let _bench = switch (testBenchMap.get(benchId)) {
      case (null) { Runtime.trap("Test bench does not exist!") };
      case (?b) { b };
    };

    testBenchMap.remove(benchId);
    componentMap.remove(benchId);
    historyMap.remove(benchId);

    let relatedDocuments = documentMap.filter(
      func(_, doc) {
        doc.associatedBenches.any(
          func(bid) {
            bid == benchId;
          }
        );
      }
    );

    let relatedDocumentKeys = relatedDocuments.keys();
    for (key in relatedDocumentKeys) {
      documentMap.remove(key);
    };
  };

  public query ({ caller }) func getTestBench(benchId : Text) : async ?TestBench {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access test benches");
    };
    testBenchMap.get(benchId);
  };

  public shared ({ caller }) func createDocument(
    id : Text,
    productDisplayName : Text,
    version : Version,
    category : Text,
    fileReference : Storage.ExternalBlob,
    semanticVersion : Text,
    tags : [Tag],
    documentVersion : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };
    if (documentMap.containsKey(id)) {
      Runtime.trap("Document already exists!");
    };

    let newDocument : Document = {
      id;
      productDisplayName;
      version;
      category;
      fileReference;
      semanticVersion;
      uploader = caller;
      associatedBenches = [];
      tags;
      documentVersion;
    };
    documentMap.add(id, newDocument);
  };

  public shared ({ caller }) func associateDocumentToBench(documentId : Text, benchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can associate documents to benches");
    };

    let document = switch (documentMap.get(documentId)) {
      case (null) { Runtime.trap("Document does not exist") };
      case (?doc) { doc };
    };

    let bench = switch (testBenchMap.get(benchId)) {
      case (null) { Runtime.trap("Bench does not exist") };
      case (?b) { b };
    };

    let updatedDocument : Document = {
      id = document.id;
      productDisplayName = document.productDisplayName;
      version = document.version;
      category = document.category;
      fileReference = document.fileReference;
      semanticVersion = document.semanticVersion;
      uploader = document.uploader;
      associatedBenches = document.associatedBenches.concat([benchId]);
      tags = document.tags;
      documentVersion = document.documentVersion;
    };
    documentMap.add(documentId, updatedDocument);

    let updatedBench : TestBench = {
      id = bench.id;
      name = bench.name;
      serialNumber = bench.serialNumber;
      agileCode = bench.agileCode;
      plmAgileUrl = bench.plmAgileUrl;
      decawebUrl = bench.decawebUrl;
      description = bench.description;
      photo = bench.photo;
      photoUrl = bench.photoUrl;
      tags = bench.tags;
      documents = bench.documents.concat([(documentId, document.version)]);
      creator = bench.creator;
    };
    testBenchMap.add(benchId, updatedBench);

    let historyEntry : HistoryEntry = {
      timestamp = Time.now();
      action = "Document added";
      user = caller;
      details = "Added document: " # document.productDisplayName;
    };
    addHistoryEntry(benchId, historyEntry);
  };

  public shared ({ caller }) func removeDocumentFromBench(documentId : Text, benchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove documents from benches");
    };

    let document = switch (documentMap.get(documentId)) {
      case (null) { Runtime.trap("Document does not exist") };
      case (?doc) { doc };
    };

    let bench = switch (testBenchMap.get(benchId)) {
      case (null) { Runtime.trap("Bench does not exist") };
      case (?b) { b };
    };

    let updatedAssociatedBenches = document.associatedBenches.filter(
      func(bid : Text) : Bool {
        bid != benchId;
      }
    );

    let updatedDocument : Document = {
      id = document.id;
      productDisplayName = document.productDisplayName;
      version = document.version;
      category = document.category;
      fileReference = document.fileReference;
      semanticVersion = document.semanticVersion;
      uploader = document.uploader;
      associatedBenches = updatedAssociatedBenches;
      tags = document.tags;
      documentVersion = document.documentVersion;
    };
    documentMap.add(documentId, updatedDocument);

    let updatedDocuments = bench.documents.filter(
      func(docRef : (Text, Version)) : Bool {
        docRef.0 != documentId;
      }
    );

    let updatedBench : TestBench = {
      id = bench.id;
      name = bench.name;
      serialNumber = bench.serialNumber;
      agileCode = bench.agileCode;
      plmAgileUrl = bench.plmAgileUrl;
      decawebUrl = bench.decawebUrl;
      description = bench.description;
      photo = bench.photo;
      photoUrl = bench.photoUrl;
      tags = bench.tags;
      documents = updatedDocuments;
      creator = bench.creator;
    };
    testBenchMap.add(benchId, updatedBench);

    let historyEntry : HistoryEntry = {
      timestamp = Time.now();
      action = "Document removed";
      user = caller;
      details = "Removed document: " # document.productDisplayName;
    };
    addHistoryEntry(benchId, historyEntry);
  };

  public shared ({ caller }) func setComponents(benchId : Text, components : [Component]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage components");
    };

    if (not testBenchMap.containsKey(benchId)) {
      Runtime.trap("Bench does not exist");
    };

    componentMap.add(benchId, components);

    let historyEntry : HistoryEntry = {
      timestamp = Time.now();
      action = "Components updated";
      user = caller;
      details = "Updated component table";
    };
    addHistoryEntry(benchId, historyEntry);
  };

  public query ({ caller }) func getComponents(benchId : Text) : async [Component] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access components");
    };

    switch (componentMap.get(benchId)) {
      case (null) { [] };
      case (?components) { components };
    };
  };

  private func duplicateComponentToBenchInternal(component : Component, targetBenchId : Text, caller : Principal) {
    let targetBench = switch (testBenchMap.get(targetBenchId)) {
      case (null) { Runtime.trap("Target bench does not exist") };
      case (?tb) { tb };
    };

    let existingComponents = switch (componentMap.get(targetBenchId)) {
      case (null) { [] };
      case (?comps) { comps };
    };

    let duplicatedComponent : Component = {
      component with
      associatedBenchId = targetBench.id
    };

    componentMap.add(targetBench.id, existingComponents.concat([duplicatedComponent]));

    let historyEntry : HistoryEntry = {
      timestamp = Time.now();
      action = "Duplicate component";
      user = caller;
      details = "Component duplicated to target bench: " # targetBench.name;
    };
    addHistoryEntry(targetBench.id, historyEntry);
  };

  public shared ({ caller }) func duplicateComponentToBench(_benchId : Text, component : Component, targetBenchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate components between benches");
    };

    duplicateComponentToBenchInternal(component, targetBenchId, caller);
  };

  public shared ({ caller }) func duplicateComponentToBenches(component : Component, targetBenchIds : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate components between benches");
    };
    switch (componentMap.get(component.associatedBenchId)) {
      case (null) { Runtime.trap("Source bench does not exist") };
      case (?_) {};
    };

    for (targetBenchId in targetBenchIds.values()) {
      duplicateComponentToBenchInternal(component, targetBenchId, caller);
    };
  };

  private func addHistoryEntry(benchId : Text, entry : HistoryEntry) {
    let currentHistory = switch (historyMap.get(benchId)) {
      case (null) { [] };
      case (?history) { history };
    };
    historyMap.add(benchId, currentHistory.concat([entry]));
  };

  public query ({ caller }) func getBenchHistory(benchId : Text) : async [HistoryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access bench history");
    };

    switch (historyMap.get(benchId)) {
      case (null) { [] };
      case (?history) { history };
    };
  };

  public query ({ caller }) func getPublicUserInfo(user : Principal) : async ?PublicUserInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access public user info");
    };

    switch (userProfileMap.get(user)) {
      case (null) { null };
      case (?profile) {
        ?{
          name = profile.name;
          profilePicture = profile.profilePicture;
        };
      };
    };
  };
};

