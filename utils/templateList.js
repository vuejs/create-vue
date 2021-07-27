const templateList = ['default', 'spa']
  .flatMap(x => [x, x + '-ts'])
  .flatMap(x => [x, x + '-with-tests'])

export default templateList
