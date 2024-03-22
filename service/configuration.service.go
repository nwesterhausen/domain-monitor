package service

import "github.com/nwesterhausen/domain-monitor/configuration"

type ConfigurationService struct {
	store configuration.Configuration
}

func NewConfigurationService(store configuration.Configuration) ConfigurationService {
	return ConfigurationService{store: store}
}

func (s *ConfigurationService) GetConfiguration() configuration.ConfigurationFile {
	return s.store.Config
}

func (s *ConfigurationService) GetAppConfiguration() configuration.AppConfiguration {
	return s.store.Config.App
}

func (s *ConfigurationService) GetAlertsConfiguration() configuration.AlertsConfiguration {
	return s.store.Config.Alerts
}

func (s *ConfigurationService) GetSMTPConfiguration() configuration.SMTPConfiguration {
	return s.store.Config.SMTP
}

func (s *ConfigurationService) GetSchedulerConfiguration() configuration.SchedulerConfiguration {
	return s.store.Config.Scheduler
}

func (s *ConfigurationService) SetConfiguration(config configuration.ConfigurationFile) {
	s.store.Config = config
	s.store.Flush()
}

func (s *ConfigurationService) SetAppConfiguration(config configuration.AppConfiguration) {
	s.store.Config.App = config
	s.store.Flush()
}

func (s *ConfigurationService) SetAlertsConfiguration(config configuration.AlertsConfiguration) {
	s.store.Config.Alerts = config
	s.store.Flush()
}

func (s *ConfigurationService) SetSMTPConfiguration(config configuration.SMTPConfiguration) {
	s.store.Config.SMTP = config
	s.store.Flush()
}

func (s *ConfigurationService) SetSchedulerConfiguration(config configuration.SchedulerConfiguration) {
	s.store.Config.Scheduler = config
	s.store.Flush()
}

type ErrInvalidConfigurationKey struct {
	Key string
}

type ErrInvalidConfigurationSection struct {
	Section string
}

func (e *ErrInvalidConfigurationKey) Error() string {
	return "Invalid configuration key: " + e.Key
}

func (e *ErrInvalidConfigurationSection) Error() string {
	return "Invalid configuration section: " + e.Section
}

// Get each specific configuration value
func (s *ConfigurationService) GetConfigurationValue(section string, key string) (interface{}, error) {
	switch section {
	case "app":
		switch key {
		case "port":
			return s.GetAppConfiguration().Port, nil
		case "automateWHOISRefresh":
			return s.GetAppConfiguration().AutomateWHOISRefresh, nil
		default:
			return nil, &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	case "alerts":
		switch key {
		case "admin":
			return s.GetAlertsConfiguration().Admin, nil
		case "sendAlerts":
			return s.GetAlertsConfiguration().SendAlerts, nil
		case "send2MonthAlert":
			return s.GetAlertsConfiguration().Send2MonthAlert, nil
		case "send1MonthAlert":
			return s.GetAlertsConfiguration().Send1MonthAlert, nil
		case "send2WeekAlert":
			return s.GetAlertsConfiguration().Send2WeekAlert, nil
		case "send1WeekAlert":
			return s.GetAlertsConfiguration().Send1WeekAlert, nil
		case "send3DayAlert":
			return s.GetAlertsConfiguration().Send3DayAlert, nil
		case "sendDailyExpiryAlert":
			return s.GetAlertsConfiguration().SendDailyExpiryAlert, nil
		default:
			return nil, &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	case "smtp":
		switch key {
		case "host":
			return s.GetSMTPConfiguration().Host, nil
		case "port":
			return s.GetSMTPConfiguration().Port, nil
		case "secure":
			return s.GetSMTPConfiguration().Secure, nil
		case "authUser":
			return s.GetSMTPConfiguration().AuthUser, nil
		case "authPass":
			return s.GetSMTPConfiguration().AuthPass, nil
		case "enabled":
			return s.GetSMTPConfiguration().Enabled, nil
		case "fromName":
			return s.GetSMTPConfiguration().FromName, nil
		case "fromAddress":
			return s.GetSMTPConfiguration().FromAddress, nil
		default:
			return nil, &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	case "scheduler":
		switch key {
		case "whoisCacheStaleInterval":
			return s.GetSchedulerConfiguration().WhoisCacheStaleInterval, nil
		case "useStandardWhoisRefreshSchedule":
			return s.GetSchedulerConfiguration().UseStandardWhoisRefreshSchedule, nil
		default:
			return nil, &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	default:
		return nil, &ErrInvalidConfigurationSection{
			Section: section,
		}
	}
}

// Set each specific configuration value
func (s *ConfigurationService) SetConfigurationValue(section string, key string, value interface{}) error {
	switch section {
	case "app":
		switch key {
		case "port":
			s.store.Config.App.Port = value.(int)
		case "automateWHOISRefresh":
			s.store.Config.App.AutomateWHOISRefresh = value.(bool)
		default:
			return &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	case "alerts":
		switch key {
		case "admin":
			s.store.Config.Alerts.Admin = value.(string)
		case "sendAlerts":
			s.store.Config.Alerts.SendAlerts = value.(bool)
		case "send2MonthAlert":
			s.store.Config.Alerts.Send1MonthAlert = value.(bool)
		case "send2WeekAlert":
			s.store.Config.Alerts.Send2WeekAlert = value.(bool)
		case "send1WeekAlert":
			s.store.Config.Alerts.Send1WeekAlert = value.(bool)
		case "send3DayAlert":
			s.store.Config.Alerts.Send3DayAlert = value.(bool)
		case "sendDailyExpiryAlert":
			s.store.Config.Alerts.SendDailyExpiryAlert = value.(bool)
		default:
			return &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	case "smtp":
		switch key {
		case "host":
			s.store.Config.SMTP.Host = value.(string)
		case "port":
			s.store.Config.SMTP.Port = value.(int)
		case "secure":
			s.store.Config.SMTP.Secure = value.(bool)
		case "authUser":
			s.store.Config.SMTP.AuthUser = value.(string)
		case "authPass":
			s.store.Config.SMTP.AuthPass = value.(string)
		case "enabled":
			s.store.Config.SMTP.Enabled = value.(bool)
		case "fromName":
			s.store.Config.SMTP.FromName = value.(string)
		case "fromAddress":
			s.store.Config.SMTP.FromAddress = value.(string)
		default:
			return &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	case "scheduler":
		switch key {
		case "whoisCacheStaleInterval":
			s.store.Config.Scheduler.WhoisCacheStaleInterval = value.(int)
		case "useStandardWhoisRefreshSchedule":
			s.store.Config.Scheduler.UseStandardWhoisRefreshSchedule = value.(bool)
		default:
			return &ErrInvalidConfigurationKey{
				Key: key,
			}
		}
	default:
		return &ErrInvalidConfigurationSection{
			Section: section,
		}
	}

	s.store.Flush()

	return nil
}
