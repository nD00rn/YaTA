import { Dialog as OriginalDialog, IDialogProps } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'

import { ApplicationState } from 'store/reducers'
import { getDisableDialogAnimations } from 'store/selectors/settings'

/**
 * Dialog Component.
 */
const Dialog: React.FunctionComponent<Props> = ({ disableDialogAnimations, ...restProps }) => (
  <OriginalDialog
    {...restProps}
    transitionName={disableDialogAnimations ? '' : undefined}
    transitionDuration={disableDialogAnimations ? 0 : 300}
  />
)

export default connect<StateProps, {}, IDialogProps & { children: React.ReactNode }, ApplicationState>((state) => ({
  disableDialogAnimations: getDisableDialogAnimations(state),
}))(Dialog)

/**
 * React Props.
 */
interface StateProps {
  disableDialogAnimations: ReturnType<typeof getDisableDialogAnimations>
}

/**
 * React Props.
 */
type Props = StateProps & IDialogProps
