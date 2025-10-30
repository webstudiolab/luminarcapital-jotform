import classNames from 'classnames'
import styles from './TextTemplate.module.scss'

interface ITextTemplate {
  className?: string
  title: string
  data: string
}

const TextTemplate = ({ className, title, data }: ITextTemplate) => {
  return (
    <section
      className={classNames(styles['section'], 'text-template', className)}
    >
      <div className="content-block">
        <div className={styles['section-hero']}>
          <h1
            className={classNames(styles['section-hero-title'], 'font-display')}
          >
            {title}
          </h1>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 col-gutter-lr">
            <article
              className={styles['section-body']}
              dangerouslySetInnerHTML={{ __html: data }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TextTemplate
