'use strict'

const cart = []
let productQuantity

const homePage = document.querySelector('.home')
const detailPage = document.querySelector('.detail')

const productsList = document.querySelector('.products-list')

const openCartButton = document.querySelector('.cart-button')
const cartContainer = document.querySelector('.cart-container')

const cartList = document.querySelector('.cart-list')

const inputFilterName = document.querySelector('.input-filter--name')
const inputFilterSelect = document.querySelector('.input-filter--select')

const Utils = {
    formatCurrency (value) {
        const options = { style: "currency", currency: 'BRL' }
        return value.toLocaleString('pt-BR', options)
    },

    getProductHTMLTemplate (product) {
        return `
        <div data-key="${product.id}" data-category="${product.category}" class="card outlined">
            <img class="card-img" src="${product.img}" alt="">
            <p class="card-name">${product.title}</p>
            <h3 class="card-price">${this.formatCurrency(product.price)}</h3>
            <button data-button="${product.id}" class="card-button">
                Comprar
            </button>
        </div>
        `
    },

    getProductDetailHTMLTemplate (product, quantity) {
        return `
        <div class="detail-back">
            <button class="detail-back--button">
                <img src="./imgs/chevron-left.svg">
                Voltar
            </button>
        </div>
        <div class="detail-container">
            <div class="detail-img">
                <img src="${product.img}" alt="Imagem do produto">
            </div>
            <div class="detail-content">
                <p class="detail-content--name">${product.title}</p>
                <p class="detail-content--desc">${product.description}. </p>

                <div class="detail-content-sizes">
                    <div data-size="0" class="detail-content-size"></div>
                    <div data-size="1" class="detail-content-size"></div>
                    <div data-size="2" class="detail-content-size selected"></div>
                </div>

                <h4 class="detail-content--price">${Utils.formatCurrency(product.price)}</h4>

                <div class="detail-content--box">
                    <div class="detail-content--plusOrMinus">
                        <img class="detail-content--minus" src="./imgs/minus-circle.svg" alt="">
                        <span>${quantity}</span>
                        <img class="detail-content--plus" src="./imgs/plus-circle.svg" alt="">
                    </div>

                    <button class="detail-content--buy">
                        <img src="./imgs/shopping-cart-white.svg" alt="">
                        Comprar
                    </button>
                </div>
            </div>
        </div>
        `
    },

    getProductCartHTMLTemplate (product, quantity, size) {
        return `
        <div class="cart-product">
            <div class="cart-product--box">
                <img src="${product.img}" alt="" class="cart-product--img">
                <div class="cart-product--info">
                    <div class="cart-product--info__title">${product.title} (${size})</div>
                </div>
            </div>
            <div class="cart-product--box">
                <div class="cart-product--price">${this.formatCurrency(product.price)}</div>
                <div class="cart-product--quantity">
                    <button class="cart-product--quantity__minus">-</button>
                    <div class="cart-product--quantity__text">${quantity}</div>
                    <button class="cart-product--quantity__plus">+</button>
                </div>
            </div>
        </div>
        `
    },

    formatProductSize (size) {
        let sizeName
        switch (size) {
            case 0:
                sizeName = 'P'
                break; 
            case 1:
                sizeName = 'M'
                break;
            case 2:
                sizeName = 'G'
                break;
        }

        return sizeName
    },
    
    hideUnfilteredProducts (element)  {
        element.classList.add('hide')
        element.classList.remove('show')
    },
    
    showFilteredProducts (element) {
        element.classList.add('show')
        element.classList.remove('hide')
    }
}

const UI = {
    updateUI () {
        productsList.innerHTML = ''
        productsJson.forEach(product => {
            productsList.innerHTML += Utils.getProductHTMLTemplate(product)
        })
    },

    loadOptions () {
        productsJson.forEach(product => {
            const template = `<option value="${product.category}">${product.category}</option>`
            const options = Array.from(inputFilterSelect.children)
            const indexOfRepetedCategory = options.findIndex(option => option.textContent === product.category)
    
            if (indexOfRepetedCategory > -1) return
    
            inputFilterSelect.innerHTML += template
        })
    }
}

UI.updateUI()
UI.loadOptions()

document.querySelectorAll('.card-button').forEach(button => {
    button.addEventListener('click', event => {
        const dataOfClickedButton = Number(event.target.dataset.button)
        const clickedProduct = productsJson.find(product => product.id === dataOfClickedButton)
        productQuantity = 1

        homePage.style.display = 'none'
        detailPage.style.display = 'block'
        detailPage.innerHTML = Utils.getProductDetailHTMLTemplate(clickedProduct, productQuantity)

        document.querySelector('.detail-back--button').addEventListener('click', () => {
            detailPage.style.display = 'none'
            homePage.style.display = 'block'
        })

        document.querySelectorAll('.detail-content-size').forEach((size, index) => {
            size.innerHTML = clickedProduct.sizes[index]

            size.addEventListener('click', () => {
                document.querySelector('.detail-content-size.selected').classList.remove('selected')
                size.classList.add('selected')
            })
        })

        document.querySelector('.detail-content--plus').addEventListener('click', () => {
            productQuantity++
            document.querySelector('.detail-content--plusOrMinus span').innerHTML = productQuantity
        })

        document.querySelector('.detail-content--minus').addEventListener('click', () => {
            if (productQuantity > 1) {
                productQuantity--
                document.querySelector('.detail-content--plusOrMinus span').innerHTML = productQuantity
            }
        })

        document.querySelector('.detail-content--buy').addEventListener('click', () => {
            const size = Number(document.querySelector('.detail-content-size.selected').dataset.size)
            const sizeName = Utils.formatProductSize(size)

            const identifier = `${clickedProduct.id}@${sizeName}`

            const indexOfRepetedProduct = cart.findIndex(product => product.identifier === identifier)
            const hasProductInCart = indexOfRepetedProduct > -1

            if (hasProductInCart) {
                cart[indexOfRepetedProduct].quantity = productQuantity
                updateCart()
                return
            }

            cart.push({
                identifier,
                size,
                id: clickedProduct.id,
                quantity: productQuantity
            })

            updateCart()
            console.log(cart)
        })
    })
})

const updateCart = () => {
    cartList.innerHTML = ''
    let total = 0

    cart.forEach(productCart => {
        const productObject = productsJson.find(product => productCart.id === product.id)
        const productSizeString = Utils.formatProductSize(productCart.size)

        total += productObject.price * productCart.quantity

        const div = document.createElement('div')
        div.classList.add('cart-product')
        div.innerHTML = Utils.getProductCartHTMLTemplate(productObject, productCart.quantity, productSizeString)

        cartList.append(div)

        div.querySelector('.cart-product--quantity__plus').addEventListener('click', () => {
            productCart.quantity++
            updateCart()
        })

        div.querySelector('.cart-product--quantity__minus').addEventListener('click', () => {
            if (productCart.quantity > 1) {
                productCart.quantity--
                updateCart()
                return
            }

            cart.splice(cart.indexOf(productCart), 1)
            updateCart()
        })
    })

    document.querySelector('.cart-money--total span').innerHTML = Utils.formatCurrency(total)
}

inputFilterName.addEventListener('input', event => {
    const inputValue = event.target.value.trim().toLowerCase()
    const productsAsArray = Array.from(productsList.children)

    productsAsArray
        .filter(product => product.querySelector('.card-name').textContent.toLowerCase().trim().includes(inputValue))
        .forEach(productElement => Utils.showFilteredProducts(productElement))

    productsAsArray
        .filter(product => !product.querySelector('.card-name').textContent.toLowerCase().trim().includes(inputValue)).forEach(productElement => Utils.hideUnfilteredProducts(productElement))       
})

inputFilterSelect.addEventListener('change', event => {
    const selectValue = event.target.value
    const productsAsArray = Array.from(productsList.children)

    if (selectValue === 'Todas') {
        productsAsArray.forEach(product => Utils.showFilteredProducts(product))
        return
    }

    productsAsArray
        .filter(product => product.dataset.category === selectValue)
        .forEach(product => Utils.showFilteredProducts(product))

    productsAsArray
        .filter(product => product.dataset.category !== selectValue)
        .forEach(product => Utils.hideUnfilteredProducts(product))
})

document.querySelector('.header-logo').addEventListener('click', () => {
    detailPage.style.display = 'none'
    homePage.style.display = 'block'
})

openCartButton.addEventListener('click', () => {
    cartContainer.classList.toggle('show-cart-container')
})