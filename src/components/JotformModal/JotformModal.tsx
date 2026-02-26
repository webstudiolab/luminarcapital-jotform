import styles from './JotformModal.module.scss'

const JotformModal = () => {
  return (
    <div className={styles['jotform']}>
      <iframe
        id="JotFormIFrame-260432292234046"
        title="Luminar Capital - Business Financing Application"
        onLoad={() => window.parent.scrollTo(0, 0)}
        allowTransparency={true}
        allow="geolocation; microphone; camera; fullscreen; payment"
        src="https://form.jotform.com/260432292234046"
        frameBorder={0}
        style={{ minWidth: '100%', maxWidth: '100%', border: 'none' }}
        scrolling="no"
        className={styles['jotform-iframe']}
      />
    </div>
  )
}

export default JotformModal
