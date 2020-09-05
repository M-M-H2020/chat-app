const socket = io()

// Elements 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')


const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML

const locationTemplate = document.querySelector('#location-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options
const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix:true})


socket.on('message', (msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate,{
        name:msg.username,
        msg:msg.text,
        createdAt: moment(msg.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (obj) => {
    
    const html = Mustache.render(locationTemplate,{
        name:obj.username,
        createdAt: moment(obj.createdAt).format('hh:mm A'),
        URL:obj.URL
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// Auto scrolling 
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled ?
    const scrollOffset = $messages.scrollTop +  visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

$messageFormInput.focus()
$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    // Disable button when sending the message
    $messageFormButton.setAttribute('disabled','')
    const message = event.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
    // Enable button after sending the message
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error);
        }
        console.log('Message delivered!');
    })
})


$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.');
    }
    navigator.geolocation.getCurrentPosition(({coords}) => {
        // Disable button when sending the message
        $sendLocationButton.setAttribute('disabled', 'disabled');
        const {latitude, longitude} = coords
        socket.emit('sendLocation',{latitude, longitude}, (error) => {
             // Enable button after sending the message
            $sendLocationButton.removeAttribute('disabled');
            if(error){
                return console.log(error);
            }           
            console.log('Your location has been shared successfully!');
        })
        
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})