import UserIcon from "@/images/userIcon.svg";
import UserIconGreen from "@/images/userIcongreen.svg";
import UserProfile from "@/images/user_profile.svg";
import UserProfileGreen from "@/images/user_profile_green.svg";
import UserRoles from "@/images/user_roles.svg";
import UserRolesGreen from "@/images/user_roles_green.svg";
import Password from "@/images/password.svg";
import PasswordGreen from "@/images/passwordGreen.svg";
import ManageTemplateIcon from "@/images/file-edit.svg";
import ManageTemplateIconGreen from "@/images/file-edit-green.svg";
import ManageRulesIcon from "@/images/manage-rules.svg";
import ManageRulesIconGreen from "@/images/manage-rules-green.svg";
import BulkUpload from "@/images/bulkUpload.svg";
import BulkUploadGreen from "@/images/bulkUploadGreen.svg";
import FailedLeadsIcon from "@/images/failedLeads.svg";
import FailedLeadsGreen from "@/images/failedLeadsGreen.svg";
import Masters from "@/images/masters.svg";
import MastersGreen from "@/images/mastersGreen.svg";
import Profile from "@/components/Profile";
import ManageUsers from "@/app/settings/components/Users/ManageUsers";
import ManageRoles from "@/app/settings/components/Roles/ManageRoles";
import ManageTemplates from "@/app/settings/components/Templates/ManageTemplates";
import ChangePassword from "@/components/ChangePassword";
import ManageRules from "@/app/settings/components/Rules/ManageRules";

import UserProfileLead from "@/images/user-profile-star.svg";
import UserProfileLeadGreen from "@/images/user-profile-star-green.svg";
import FollowUpsIcon from "@/images/follow-ups.svg";
import FollowUpsIconGreen from "@/images/follow-ups-green.svg";
import LeadManagement from "@/app/leads/components/LeadManagement/LeadManagement";
import FollowUpsTabs from "@/app/leads/components/FollowUps/FollowUpsTabs";

import MarketingReports from "@/components/Marketing/MarketingReports";
import SocialFieldMapper from "@/components/SocialFieldMapper";
import MasterTable from "@/components/Master/Mastertable";
import BulkUploadHistory from "@/app/leads/components/BulkUploadHistory/BulkUploadHistory";
import FailedLeads from "@/app/leads/components/FailedLeads/FailedLeads";
import AnalyticsSideIcon from "@/images/analytics-option.svg";
import AnalyticsSideIconActive from "@/images/analytics-option-green.svg";
import AnalyticsIframeComponent from "@/components/Analytics/AnalyticsIframeComponent";
//import Reports from "@/app/reports/components/report";
import Reports from "@/app/reports/components/report";

import IvrAnalysisIcon from "@/images/IvrAnalysisIcon.svg";
import IvrAnalysisGreenIcon from "@/images/IvrAnalysisGreenIcon.svg";
import CrmLeadAnalyticsIframe from "@/components/Analytics/CrmLeadAnalyticsIframe";
import DataUpdateCenter from "@/components/Analytics/DataUpdateCenter";

import CrmAnalyticsIcon from "@/images/crmAnalyticsIcon.svg";
import CrmAnalyticsIconActive from "@/images/crmAnalyticsIconGreen.svg";
import DataUpdateIcon from "@/images/dataUpdate.svg";
import DataUpdateIconActive from "@/images/dataUpdateGreen.svg";

// * bascially shoud contain all the icons and componets of the side bars of various pages
export const headerMap = {
  6: {
    icon: <UserIcon />,
    activeIcon: <UserIconGreen />,
    component: <Profile />,
  },
  7: {
    icon: <UserProfile />,
    activeIcon: <UserProfileGreen />,
    component: <ManageUsers />,
  },
  8: {
    icon: <UserRoles />,
    activeIcon: <UserRolesGreen />,
    component: <ManageRoles />,
  },
  9: {
    icon: <ManageTemplateIcon />,
    activeIcon: <ManageTemplateIconGreen />,
    component: <ManageTemplates />,
  },
  12: {
    icon: <Password />,
    activeIcon: <PasswordGreen />,
    component: <ChangePassword />,
  },
  38: {
    icon: <UserProfileLead />,
    activeIcon: <UserProfileLeadGreen />,
    component: <LeadManagement />,
  },
  39: {
    icon: <FollowUpsIcon />,
    activeIcon: <FollowUpsIconGreen />,
    component: <FollowUpsTabs />,
  },
  72: {
    icon: <ManageTemplateIcon />,
    activeIcon: <ManageTemplateIconGreen />,
    component: <MarketingReports />,
  },
  79: {
    icon: <ManageRulesIcon />,
    activeIcon: <ManageRulesIconGreen />,
    component: <ManageRules />,
  },
  85: {
    icon: <ManageTemplateIcon />,
    activeIcon: <ManageTemplateIconGreen />,
    component: <SocialFieldMapper />,
  },
  87: {
    icon: <ManageTemplateIcon />,
    activeIcon: <ManageTemplateIconGreen />,
    component: <MasterTable />,
  },
  92: {
    icon: <BulkUpload />,
    activeIcon: <BulkUploadGreen />,
    component: <BulkUploadHistory />,
  },
  93: {
    icon: <FailedLeadsIcon />,
    activeIcon: <FailedLeadsGreen />,
    component: <FailedLeads />,
  },
  99: {
    icon: <IvrAnalysisIcon />,
    activeIcon: <IvrAnalysisGreenIcon />,
    component: <Reports />,
  },
  98: {
    icon: <AnalyticsSideIcon />,
    activeIcon: <AnalyticsSideIconActive />,
    component: <AnalyticsIframeComponent />,
  },
  107: {
    icon: <CrmAnalyticsIcon />,
    activeIcon: <CrmAnalyticsIconActive />,
    component: <CrmLeadAnalyticsIframe />,
  },
  108: {
    icon: <DataUpdateIcon />,
    activeIcon: <DataUpdateIconActive />,
    component: <DataUpdateCenter />,
  },
};

// * icons and components for settings sidebar navigation
export const settingsMap = {
  6: {
    icon: <UserIcon />,
    activeIcon: <UserIconGreen />,
    component: <Profile />,
  },
  7: {
    icon: <UserProfile />,
    activeIcon: <UserProfileGreen />,
    component: <ManageUsers />,
  },
  8: {
    icon: <UserRoles />,
    activeIcon: <UserRolesGreen />,
    component: <ManageRoles />,
  },
  9: {
    icon: <ManageTemplateIcon />,
    activeIcon: <ManageTemplateIconGreen />,
    component: <ManageTemplates />,
  },
  12: {
    icon: <Password />,
    activeIcon: <PasswordGreen />,
    component: <ChangePassword />,
  },
  79: {
    icon: <ManageRulesIcon />,
    activeIcon: <ManageRulesIconGreen />,
    component: <ManageRules />,
  },
  85: {
    icon: <ManageTemplateIcon />,
    activeIcon: <ManageTemplateIconGreen />,
    component: <SocialFieldMapper />,
  },
  87: {
    icon: <Masters />,
    activeIcon: <MastersGreen />,
    component: <MasterTable />,
  },
};

// * icons and components for lead sidebar navigation
export const leadsMap = {
  38: {
    icon: <UserProfileLead />,
    activeIcon: <UserProfileLeadGreen />,
    component: <LeadManagement />,
  },
  39: {
    icon: <FollowUpsIcon />,
    activeIcon: <FollowUpsIconGreen />,
    component: <FollowUpsTabs />,
  },
  92: {
    icon: <BulkUpload />,
    activeIcon: <BulkUploadGreen />,
    component: <BulkUploadHistory />,
  },
  93: {
    icon: <FailedLeadsIcon />,
    activeIcon: <FailedLeadsGreen />,
    component: <FailedLeads />,
  },
};

// * icons and components for marketing sidebar navigation
export const marketingMap = {
  72: {
    icon: <ManageTemplateIcon />,
    activeIcon: <ManageTemplateIconGreen />,
    component: <MarketingReports />,
  },
};

// * icons and components for reports sidebar navigation
export const reportsMap = {
  99: {
    icon: <IvrAnalysisIcon />,
    activeIcon: <IvrAnalysisGreenIcon />,
    component: <Reports />,
  },
};

// * icons and components for analytics sidebar navigation
export const analyticsMap = {
  98: {
    icon: <AnalyticsSideIcon />,
    activeIcon: <AnalyticsSideIconActive />,
    component: <AnalyticsIframeComponent />,
  },
  107: {
    icon: <CrmAnalyticsIcon />,
    activeIcon: <CrmAnalyticsIconActive />,
    component: <CrmLeadAnalyticsIframe />,
  },
  108: {
    icon: <DataUpdateIcon />,
    activeIcon: <DataUpdateIconActive />,
    component: <DataUpdateCenter />,
  },
};
