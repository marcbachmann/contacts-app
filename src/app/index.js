module.exports = createContactsApp

function createContactsApp (api) {
  var components = []
  return {
    register: function registerComponent (name, template, controller) {
      components.push(name)
      riot.tag(name, template, controller)
    },
    render: function renderContactsApp (element) {
      riot.mount('contacts-app', {api: api, contact: undefined, isEditing: false, components: components})
    }
  }
}


var riot = require('riot')
var rippleMixin = require('./ripple-mixin')
var icons = require('./icons')

riot.tag('icon', `
<svg name="svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"></svg>
`, function (opts) {
  this.svg.innerHTML = icons[opts.type]
})

riot.tag('primary-action-button', `
  <button class="cnt-primary-action">
    <icon type="{icon}"></icon>
  </button>
`, function (opts) {
  var self = this
  this.icon = opts.icon
  this.mixin(rippleMixin({parent: 'button'}))

  function blur () {
    self.root.querySelector('button').blur()
  }

  var triggered = false
  function triggerAction (evt) {
    blur()
    if (triggered) return
    triggered = true
    opts.action && opts.action(evt)
    setTimeout(function () { triggered = false }, 1000)
  }

  this.root.addEventListener('click', triggerAction)
  this.root.addEventListener('mouseout', blur)

  // Accept SPACE
  this.root.addEventListener('keyup', function (e) {
    if (e.keyCode === 32) return triggerAction(e)
  })
})

riot.tag('text-input', `
  <input name="input" type="text" onkeyup="{onkeyup}"/>
  <label for="{label.toLowerCase()}">{label}</label>
`, function (opts) {
  var self = this
  this.label = opts.label
  this.input.value = opts.value || ''
  checkValue.call(this)
  this.onkeyup = function (evt) {
    checkValue.call(self)
    opts.onkeyup && opts.onkeyup(evt)
  }
})

function checkValue () {
  if (this.input.value) {
    if (!/not-empty/.test(this.root.className)) {
      this.root.className += ' not-empty'
    }
  } else {
    this.root.className = this.root.className.replace(' not-empty', '')
  }
}


riot.tag('contacts-app', `
  <div class="cnt-header"></div>
  <div class="cnt-container" name="container">
    <contact-results
      search="{search}"
      contacts="{contacts}"
      open="{open}"
      class="cnt-results"></contact-results>

    <div class="cnt-action">
      <primary-action-button icon="add"></primary-action-button>
    </div>
  </div>
`, function (opts) {
  var self = this
  this.base = opts.base || '/contacts'
  this.search = opts.api.search
  this.isEditing = opts.isEditing || false
  this.contacts = opts.contacts
  this.open = function (evt) {
    var contact = evt.item.contact
    riot.route(self.base + '/' + contact.id)
  }

  var card
  this.showContact = function (contact) {
    var $card = document.createElement('contact-card')
    $card.className = 'cnt-card'
    self.hideContact(true)
    card = riot.mount($card, 'contact-card', {
      api: opts.api,
      contact: contact,
      isEditing: self.isEditing,
      components: opts.components
    })
    self.container.insertBefore($card, self.container.children[1])
    self.update({showCard: true})
  }

  this.hideContact = function (silent) {
    card && card[0].unmount(false)
    card = undefined
    if (!silent) self.update({showCard: false})
  }

  riot.route('/', function () {
    self.hideContact()
  })

  riot.route(self.base + '/*', function (id) {
    opts.api.get(parseInt(id), function (err, contact) {
      if (err) return console.error(err)
      if (!contact) return console.log('Contact not found')
      self.showContact(contact)
    })
  })

  // riot.route.base('/')
  riot.route.start(true)
})

riot.tag('raw', '', function (opts) {
  this.root.innerHTML = opts.html
})

riot.tag('cnt-list', `
  <div class="cnt-list__prefix">
    <icon if="{prefix.type == 'icon'}" class="{prefix.class}" type="{prefix.value}"></icon>
    <raw if="{prefix.type == 'raw'}" class="{prefix.class}" html="{prefix.value}"></raw>
  </div>
  <ul class="cnt-list__content"><yield/></ul>
`, function (opts) {
  this.root.className += ' cnt-list'

  if (typeof opts.icon === 'string') {
    this.prefix = {type: 'icon', value: opts.icon}
  } else {
    this.prefix = opts.prefix
  }

  // TODO MB: This is a hack around riotjs
  this.contact = this.parent.contact
})

riot.tag('cnt-list-item', `
  <div class="inner"><yield/></div>
`, function (opts) {
  var className = 'cnt-list__item'
  if (typeof opts.notSelectable === 'string') className += ' cnt-not-selectable'

  if (this.root.className.length) {
    className = ' ' + className
  }

  this.root.className += className
  if (typeof opts.ripple === 'string') this.mixin(rippleMixin({parent: '.inner'}))
})

riot.tag('cnt-filter', `
  {current.name}
    <icon type="down" if="{!isOpen}"></icon>
    <icon type="up" if="{isOpen}"></icon>
`, function (opts) {
  this.isOpen = opts.isActive || false
  this.current = opts.options[0]
})

riot.tag('contact-results', `
  <div class="cnt-results__head {'search-is-active': searchIsVisible}">
    <cnt-filter
      class="cnt-filter"
      options="{[{'name': 'All'}, {name: 'Bar'}]}">{current.name}</cnt-filter>

    <div class="cnt-search">
      <icon type="search" class="cnt-search__icon"></icon>
      <input
        class="cnt-search__input"
        name="searchInput"
        onfocus="{toggleSearch}"
        onblur="{toggleSearch}"
        type="text" onkeyup="{search}"
        placeholder="Search"/>
      <div class="cnt-search__line"></div>
    </div>
  </div>

  <cnt-list each="{group in groups}" prefix="{group.prefix}" >
    <cnt-list-item class="{activeClass(contact.id)}"
      ripple
      not-selectable
      each="{ contact in group.items }"
      onclick="{ open }">
      <icon class="cnt-list__avatar" type="person" size="40"></icon>
      {contact.name}
    </cnt-list-item>
  </cnt-list>
`, function (opts) {
  var self = this
  this.activeClass = function (id) {
    return id === self.parent.contact.id ? 'cnt-list__item--active' : ''
  }

  this.search = function () {
    var query = self.searchInput.value
    opts.search({
      query: query
    }, function (err, contacts) {
      if (err) return console.error(err)

      this.groups = [{
        prefix: {type: 'icon', value: 'star'},
        items: contacts
      },
      {
        prefix: {type: 'raw', class: 'cnt-list__promoted-char', value: 'B'},
        items: contacts
      }]

      self.update()
    })
  }

  if (!this.groups || !this.groups.length) this.search()

  this.toggleSearch = function (evt) {
    if (!self.searchInput.value) self.update({searchIsVisible: !self.searchIsVisible})
  }

  this.open = opts.open
})

riot.tag('contact-card', `
    <div class="cnt-card__header">
      <div
        class="cnt-card__actions"
        if="{!isEditing}">
        <icon type="edit"
          onclick="{toggleEditMode}"></icon>
        <icon type="more"></icon>
      </div>

      <div
        class="cnt-card__actions"
        if="{isEditing}">
        <icon type="check"
          onclick="{toggleEditMode}"></icon>
      </div>

      <div if="{isEditing}" class="cnt-card__edit-name">
        <text-input name="firstName" label="First name" type="text" value="{contact.firstName}"></text-input>
        <text-input name="lastName" label="Last name" type="text" value="{contact.lastName}"></text-input>
      </div>

      <div if="{!isEditing}"
        class="cnt-card__name cnt-card__name--view">
        {contact.name}
      </div>
    </div>
    <cnt-card-content class="cnt-card__content" components="{components}" contact="{contact}"></cnt-card-content>
`, 'class="cnt-card"', function (opts) {
  const self = this
  self.base = opts.base || '/contacts'

  riot.route(self.base + '/*/edit', function (id) {
    opts.api.get(parseInt(id), function (err, contact) {
      if (err) return console.error(err)
      if (!contact) return console.log('Contact not found')
      self.update({contact: contact, isEditing: true})
    })
  })

  this.contact = opts.contact
  this.components = opts.components
  this.isEditing = opts.isEditing
  this.toggleEditMode = function () {
    var url
    if (!self.isEditing) {
      url = self.base + '/' + self.contact.id + '/edit'
    } else {
      url = self.base + '/' + self.contact.id
    }

    riot.route(url)
  }
})

// <cnt-card-content tags="{['phones', 'places']}" contact="{parent.contact}"></cnt-card-content>
riot.tag('cnt-card-content', null, function (opts) {
  var self = this
  opts.components.forEach(function (tag) {
    var div = document.createElement('cnt-card-content-tag')
    riot.mount(div, tag, {contact: opts.contact})
    self.root.appendChild(div)
  })
})

riot.tag('cnt-card-section', '<div class="inner"><yield/></div>', function (opts) {
  var className = 'cnt-card__section'

  if (this.root.className.length) {
    className = ' ' + className
  }

  this.root.className += className

  this.contact = this.parent.contact
})
