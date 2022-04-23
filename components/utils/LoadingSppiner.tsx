import styles from "../../styles/LoadingSpinner.module.css"

const LoadingSpinner = (props: any) => {
  return (
    <div className={styles.loading_container}>
      <div className={styles.loading_spinner} {...props}></div>
    </div>
  )
}

export default LoadingSpinner