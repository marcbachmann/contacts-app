var riot = require('riot')
var countries = require('localized-countries')(require('localized-countries/data/de'))

module.exports = function (app) {
  riot.tag('country', '', function ({code}) {
    this.root.innerHTML = countries.get(code)
  })

  riot.tag('dropdown', `
    <label onclick="{open}">Click</label>
    <div name="dropdown" class="dropdown {opening: opening}" if="{opened}">
      <yield></yield>
    </div>
  `, `
    dropdown {
      position: absolute;
      z-index: 100;
      width: 100%;
    }

    .dropdown {
      background-color: #FFF;
      margin: 0;
      min-width: 100px;
      max-height: 650px;
      overflow-y: auto;
      will-change: width, height;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);

      transform:translateY(0px);
      opacity: 1;

      transition: transform .2s ease-in,opacity .2s;
    }

    .dropdown.opening.top {
      transform: translateY(-50px);
      opacity: 0;
      transition: transform .2s cubic-bezier(0.23, 1, 0.32, 1),opacity .2s;
    }
    .dropdown.opening.bottom {
      transform: translateY(50px);
      opacity: 0;
      transition: transform .2s cubic-bezier(0.23, 1, 0.32, 1),opacity .2s;
    }
  `, '', function (opts) {
    var self = this
    this.opened = opts.opened || false
    this.dropdown.classList.add(opts.animation || 'top')

    this.open = function () {
      self.update({opened: true, opening: true})
      setTimeout(function () {
        self.update({opening: false})
      }, 0)
    }

    this.close = function () {
      this.update({opening: true})
      setTimeout(function () {
        this.update({opened: false})
      }, 200)
    }
  })

  app.register('phones', `
    <cnt-list icon="phone" if="{contact.phones.length}">
      <cnt-card-section each="{phone in parent.contact.phones}">
        <span>
          {phone.value}
          <div class="cnt-list__item-sub-title">{phone.type}</div>
        </span>
      </cnt-card-section>
    </cnt-list>
  `, function (opts) {
    this.contact = opts.contact
  })

  app.register('emails', `
    <cnt-list icon="email" if="{contact.emails.length}">
      <cnt-card-section each="{email in parent.contact.emails}">
        <span>
          {email.value}
          <div class="cnt-list__item-sub-title">{email.type}</div>
        </span>
      </cnt-card-section>
    </cnt-list>
  `, function (opts) {
    this.contact = opts.contact
  })

  riot.tag('address-view', `
    <div if="{address.name}">{address.name}</div>
    <div if="{address.street}">{address.street}</div>
    <div if="{address.zip || address.city}">{address.zip} {address.city}</div>
    <div if="{address.state}">{address.state}</div>
    <country if="{address.country}" code="{address.country}"></country>
  `, function (opts) { this.address = opts.address })


  app.register('places', `
    <cnt-list icon="place" if="{contact.addresses.length}">
      <cnt-card-section each="{address in parent.contact.addresses}">
        <span>
          <address-view address="{address}"></address-view>
          <div class="cnt-list__item-sub-title">{address.type}</div>
        </span>
      </cnt-card-section >
    </cnt-list>
  `, function (opts) {
    this.foo = 'bar'
    this.contact = opts.contact
  })

  app.register('stores', `
    <cnt-list icon="store" if="{contact.stores.length}">
      <cnt-card-section>
        <div class="cnt-list__item-sub-title">
          Einkäufe getätigt bei
        </div>
      </cnt-card-section>
      <cnt-card-section each="{store in parent.contact.stores}">
        <address-view address="{store.address}"></address-view>
      </cnt-card-section>
    </cnt-list>
  `, function (opts) {
    this.contact = opts.contact
  })

  app.register('orders', `
    <cnt-list icon="basket" if="{contact.orders.length}">
      <cnt-card-section>
        <div class="cnt-list__item-sub-title">
          Bestellungen
        </div>
      </cnt-card-section>
      <cnt-card-section>
        <table class="cnt-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr each="{order in parent.parent.contact.orders}">
              <td>{order.date.toISOString()}</td>
              <td>{order.status}</td>
              <td>{order.total}</td>
            </tr>
          </tbody>
        </table>
      </cnt-card-section>
    </cnt-list>
  `, function (opts) {
    this.contact = opts.contact
  })
}
