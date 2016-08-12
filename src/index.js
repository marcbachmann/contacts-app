var contacts = require('./contacts.json')

var search = require('simple-text-search')(contacts)
var contactsApi = {
  search: function (opts, callback) {
    callback(null, search(opts.query))
  },
  get: function (id, callback) {
    for (var i = 0; i < contacts.length; i++) {
      if (contacts[i].id === id) return callback(null, contacts[i])
    }
    callback(null, null)
  },
  save: function (id, data, callback) {
    // [{name: 'Created', data: {}}, {name: 'NameChanged', data: {}}]
    console.log('Save', id, data)
    callback(null, null)
  }
}

var app = require('./app')(contactsApi)
require('./tags')(app)
app.render(document.body.children[0])

