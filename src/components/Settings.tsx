import { Classes, Navbar, Tab, Tabs } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import Dialog from 'Containers/Dialog'
import { size } from 'Utils/styled'

import SettingsAbout from 'Components/SettingsAbout'
import { ToggleableProps } from 'Constants/toggleable'
import SettingsActions from 'Containers/SettingsActions'
import SettingsBackup from 'Containers/SettingsBackup'
import SettingsChangelog from 'Containers/SettingsChangelog'
import SettingsGeneral from 'Containers/SettingsGeneral'
import SettingsHighlights from 'Containers/SettingsHighlights'

/**
 * SettingsDialog component.
 */
const SettingsDialog = styled(Dialog)`
  height: ${size('settings.height')};
`

/**
 * SettingsNavbar component.
 */
const SettingsNavbar = styled(Navbar)`
  &.${Classes.NAVBAR} {
    height: 40px;
  }
`

/**
 * Settings tab ids.
 */
export enum SettingsTab {
  General = 'general',
  Highlights = 'highlights',
  Actions = 'actions',
  Backup = 'backup',
  Changelog = 'changelog',
  About = 'about',
}

/**
 * Settings Component.
 */
export default class Settings extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { defaultTab, toggle, visible } = this.props

    return (
      <SettingsDialog isOpen={visible} onClose={toggle} icon="cog" title="Settings">
        <SettingsNavbar>
          <Tabs id="settings-navbar" large defaultSelectedTabId={defaultTab}>
            <Tab id={SettingsTab.General} title="General" panel={<SettingsGeneral />} />
            <Tab id={SettingsTab.Highlights} title="Highlights" panel={<SettingsHighlights />} />
            <Tab id={SettingsTab.Actions} title="Actions" panel={<SettingsActions />} />
            <Tab id={SettingsTab.Backup} title="Backup" panel={<SettingsBackup />} />
            <Tab id={SettingsTab.Changelog} title="Changelog" panel={<SettingsChangelog />} />
            <Tab id={SettingsTab.About} title="About" panel={<SettingsAbout />} />
          </Tabs>
        </SettingsNavbar>
      </SettingsDialog>
    )
  }
}

/**
 * React Props.
 */
interface Props extends ToggleableProps {
  defaultTab: SettingsTab
}
