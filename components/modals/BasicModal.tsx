import { ReactNode, useState } from "react"
import { Header, Image, Modal } from 'semantic-ui-react'
import styles from "../../styles/InfoModal.module.css"
import Button from "../common/Button"


export enum ModalType {
  Info = "INFO",
  Warning = "WARNING",
  Waiting = "WAITING",
}

interface Props {
  content: string | JSX.Element,
  onConfirm?: () => void,
  onCancel?: () => void,
  onClose?: () => void,
  keepOpenOnConfirm?: boolean,
  confirmMessage?: string,
  size?: "small" | "large",
  trigger: ReactNode,
  type: ModalType,
  style?: any,
  children
}


const BasicModal = (props: Props) => {
  const [open, setOpen] = useState(false)

  const handleOnClose = () => {
    console.log('[modal] closing...')
    setOpen(false)
    if (props.onClose) { props.onClose() }
  }

  const handleOnCancel = () => {
    console.log('[modal] cancelling...')
    setOpen(false)
    if (props.onCancel) { props.onCancel() }
  }

  const handleOnConfirm = () => {
    console.log('[modal] confirming...')
    if (!props.keepOpenOnConfirm) { setOpen(false) }
    if (props.onConfirm) { props.onConfirm() }
  }

  return (
    <Modal
      onClose={handleOnClose}
      onOpen={() => { setOpen(true)}}
      open={open}
      trigger={props.trigger}
      size={props.size ? props.size : "large"}
      style={props.style}
      closeOnDimmerClick={false}
      closeOnDocumentClick={false}
      closeOnEscape={false}
    >
      <Modal.Content image>
        <Image size='medium' src="images/Agent-icon-2.png" className={styles.llama_img} />
        <Modal.Description>
          <Header className={styles.header} as="h1">Agent Franz:</Header>
          { typeof props.content === "string" ? (
            <p className={styles.text}>{props.content}</p>  
          ) : (
            <div className={styles.text}>{props.content}</div>
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        {props.type === ModalType.Waiting ? <></> : props.type === ModalType.Info ? (
          <Button onClick={handleOnClose} className={`${styles.modal_button} ${styles.close_button}`}>
            Close
          </Button>
        ) : (
          <div className={styles.warning_buttons_container}>
            <Button className={`${styles.modal_button} ${styles.cancel_button}`} onClick={handleOnCancel}>
              Cancel
            </Button>
            <Button
              content="Ok!"
              onClick={handleOnConfirm}
              className={`${styles.modal_button} ${styles.confirm_button}`}
            >
              {props.confirmMessage ? props.confirmMessage : "Ok!" }
            </Button>
          </div>
        )}
      </Modal.Actions>
    </Modal>
  )
}

export default BasicModal