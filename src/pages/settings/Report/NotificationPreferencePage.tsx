import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type NotificationPreferencePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES>;

function NotificationPreferencePage({report}: NotificationPreferencePageProps) {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES>>();
    const {translate} = useLocalize();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID || undefined}`);
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentNotificationPreference = ReportUtils.getReportNotificationPreference(report);
    const shouldDisableNotificationPreferences =
        ReportUtils.isArchivedNonExpenseReport(report, reportNameValuePairs) ||
        ReportUtils.isSelfDM(report) ||
        (!isMoneyRequestReport && ReportUtils.isHiddenForCurrentUser(currentNotificationPreference));
    const notificationPreferenceOptions = Object.values(CONST.REPORT.NOTIFICATION_PREFERENCE)
        .filter((pref) => !ReportUtils.isHiddenForCurrentUser(pref))
        .map((preference) => ({
            value: preference,
            text: translate(`notificationPreferencesPage.notificationPreferences.${preference}`),
            keyForList: preference,
            isSelected: preference === currentNotificationPreference,
        }));

    const goBack = useCallback(() => {
        ReportUtils.goBackToDetailsPage(report, route.params.backTo);
    }, [report, route.params.backTo]);

    const updateNotificationPreference = useCallback(
        (value: ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE>) => {
            ReportActions.updateNotificationPreference(report.reportID, currentNotificationPreference, value, undefined, undefined);
            goBack();
        },
        [report.reportID, currentNotificationPreference, goBack],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={NotificationPreferencePage.displayName}
        >
            <FullPageNotFoundView shouldShow={shouldDisableNotificationPreferences}>
                <HeaderWithBackButton
                    title={translate('notificationPreferencesPage.header')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    sections={[{data: notificationPreferenceOptions}]}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => updateNotificationPreference(option.value)}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={notificationPreferenceOptions.find((locale) => locale.isSelected)?.keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

NotificationPreferencePage.displayName = 'NotificationPreferencePage';

export default withReportOrNotFound()(NotificationPreferencePage);
