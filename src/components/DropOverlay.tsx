import { Callout, Classes, Intent, Overlay } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import Center from 'Components/Center'
import Imgur from 'Libs/Imgur'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  height: 100vh;
  pointer-events: none;
  width: 100vw;
`

/**
 * Tooltip component.
 */
const Tooltip = styled(Callout)`
  &.${Classes.CALLOUT} {
    padding: 20px;
    width: 360px;

    & h4.${Classes.HEADING} {
      font-size: 1.5rem;
      margin-left: 24px;
    }

    & > svg {
      height: 36px;
      width: 36px;

      &.${Classes.ICON}:first-child {
        left: 16px;
        top: 16px;
      }
    }
  }
`

/**
 * Details component.
 */
const Details = styled.ul`
  font-size: 0.8rem;
  margin-top: 24px;
  padding-left: 7px;

  & > li {
    margin: 4px 0;
  }
`

/**
 * React State.
 */
const initialState = { isDragging: false, isDraggingOver: false }
type State = Readonly<typeof initialState>

/**
 * DropOverlay Component.
 */
export default class DropOverlay extends React.Component<Props, State> {
  /**
   * Defines if a DragEvent is associated to a valid drag & drop operation / data transfer.
   * We're only accepting files at the moment.
   * Note: Even if down the line we're only accepting images (jpeg & png) files, when this function is invoked
   * (`onDragEnter`), we can't yet check for the file type for security reasons.
   * @param  event - The event.
   * @return `true` if the event is a valid data transfer.
   */
  private static isValidDataTransfer(event: DragEvent) {
    return DropOverlay.isFilesDataTransfer(event)
  }

  /**
   * Defines if a drag event data contains file(s).
   * @param  event - The event.
   * @return `true` if the event is a file(s) data transfer.
   */
  private static isFilesDataTransfer(event: DragEvent) {
    return _.includes(event.dataTransfer.types, 'Files')
  }

  /**
   * Defines if a drag event data contains an image.
   * @param  event - The event.
   * @return `true` if the event is an image data transfer.
   */
  private static isImageDataTransfer(event: DragEvent) {
    if (!_.isEmpty(event.dataTransfer.files) && DropOverlay.isFilesDataTransfer(event)) {
      const { type } = _.head(event.dataTransfer.files) as File

      if (type === 'image/png' || type === 'image/jpeg' || type === 'image/gif') {
        return true
      }
    }

    return false
  }

  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public componentDidMount() {
    document.addEventListener('dragenter', this.onDragEnter)
    document.addEventListener('dragover', this.onDragOver)
    document.addEventListener('dragleave', this.onDragLeave)
    document.addEventListener('drop', this.onDrop)
  }

  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @param  nextState - The next state.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(_nextProps: Props, nextState: State) {
    const { isDragging, isDraggingOver } = this.state
    const { isDragging: nextIsDragging, isDraggingOver: nextIsDraggingOver } = nextState

    return isDragging !== nextIsDragging || isDraggingOver !== nextIsDraggingOver
  }

  /**
   * Lifecycle: componentWillUnmount.
   */
  public componentWillUnmount() {
    document.removeEventListener('dragenter', this.onDragEnter)
    document.removeEventListener('dragover', this.onDragOver)
    document.removeEventListener('dragleave', this.onDragLeave)
    document.removeEventListener('drop', this.onDrop)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { isDragging, isDraggingOver } = this.state

    if (!isDragging && !isDraggingOver) {
      return null
    }

    return (
      <Overlay isOpen>
        <Wrapper>
          <Center>
            <Tooltip title="Upload an image" intent={Intent.PRIMARY} icon="cloud-upload">
              <Details>
                <li>Images are uploaded to Imgur.</li>
                <li>Uploads are anonymous.</li>
                <li>When done, the link will be pasted in the chat input ready to be shared.</li>
              </Details>
            </Tooltip>
          </Center>
        </Wrapper>
      </Overlay>
    )
  }

  /**
   * Triggered when a dragged element enters the document.
   * @param event - The associated event.
   */
  private onDragEnter = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const { isDraggingOver, isDragging } = this.state

    if (isDraggingOver) {
      return
    }

    if (!isDragging) {
      this.setState(() => ({ isDragging: DropOverlay.isValidDataTransfer(event) }))
    }
  }

  /**
   * Triggered when a dragged element is dragged on the document.
   * @param event - The associated event.
   */
  private onDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!this.state.isDraggingOver) {
      this.setState(() => ({ isDraggingOver: true }))
    }
  }

  /**
   * Triggered when a dragged element leaves the document.
   */
  private onDragLeave = () => {
    if (this.state.isDraggingOver) {
      this.setState(() => ({ isDragging: false, isDraggingOver: false }))
    }
  }

  /**
   * Triggered when a dragged element is dropped on the document.
   * @param  event - The associated event.
   * @return Always `false`.
   */
  private onDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const { isDraggingOver, isDragging } = this.state

    if (!isDragging && !isDraggingOver) {
      return false
    }

    this.setState(() => ({ isDragging: false, isDraggingOver: false }))

    if (DropOverlay.isImageDataTransfer(event)) {
      const file = _.head(event.dataTransfer.files)

      if (_.isNil(file)) {
        this.props.onInvalid()

        return false
      }

      this.upload(file)

      return false
    }

    this.props.onInvalid()

    return false
  }

  /**
   * Uploads a file.
   * @param file - The file to upload.
   */
  private async upload(file: File) {
    const { onError, onStart, onSuccess } = this.props

    try {
      onStart()

      const response = await Imgur.uploadAnonymousFile(file)

      onSuccess(response.data.link)
    } catch (error) {
      onError(error)
    }
  }
}

/**
 * React Props.
 */
type Props = {
  onInvalid: () => void
  onError: (error: Error) => void
  onStart: () => void
  onSuccess: (url: string) => void
}