import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type ExpirationThresholdMode = {
    #allBenches;
    #customizedBenches;
  };

  type UserProfile = {
    userId : Text;
    email : Text;
    name : Text;
    entity : Text;
    expirationThresholdMode : ExpirationThresholdMode;
    thresholdAllBenches : Nat;
    thresholdCustomizedBenches : [(Text, Nat)];
    dashboardSectionsOrdered : [Text];
    profilePicture : { #avatar : Text; #custom : Blob };
    lastSeen : ?Int;
  };

  // Actor shapes
  type Actor = {
    userProfileMap : Map.Map<Principal, UserProfile>;
  };

  public func run(old : Actor) : Actor {
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

    let updatedUserProfileMap = old.userProfileMap.map<Principal, UserProfile, UserProfile>(
      func(_principal, oldProfile) {
        let hasAllRequiredSections = defaultSections.all(
          func(section) {
            oldProfile.dashboardSectionsOrdered.any(
              func(existing) {
                existing == section;
              }
            );
          }
        );
        if (not hasAllRequiredSections) {
          let combinedSections = defaultSections.filter(
            func(section) {
              not (oldProfile.dashboardSectionsOrdered.any(
                func(existing) {
                  existing == section;
                }
              ));
            }
          ).concat(oldProfile.dashboardSectionsOrdered);
          { oldProfile with dashboardSectionsOrdered = combinedSections };
        } else {
          oldProfile;
        };
      }
    );
    { old with userProfileMap = updatedUserProfileMap };
  };
};
