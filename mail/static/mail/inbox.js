document.addEventListener('DOMContentLoaded', function () {
  if (window.location.href !== 'http://127.0.0.1:8000/') {
    window.location.href = 'http://127.0.0.1:8000/';
  }

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-submit').style.cursor = 'pointer'

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').onsubmit = send_email

  window.addEventListener('popstate', function (event) {
    if (event.state) {
      load_mailbox(event.state.mailbox);
    }
  });

});


function showMessage(message) {
  const messageDiv = document.querySelector("#message");
  messageDiv.innerHTML = message;
}


function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);

      load_mailbox('sent');

      window.history.pushState({ mailbox: 'sent' }, '', '/sent');

    });
  return false;
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-single-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  window.history.pushState({ mailbox: 'compose' }, '', '/compose');


}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-single-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 class="text-4xl my-5 text-center">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  window.history.pushState({ mailbox: mailbox }, '', `/${mailbox}`);

  // Get the message from local storage
  /* const message = localStorage.getItem('message');

  // If there is a message, display it
  if (message) {
    showMessage(message)
  } */



  fetch(`/emails/${mailbox}`, {
    method: "GET"
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
      const emailsView = document.querySelector("#emails-view");
      for (let i = 0; i < data.length; i++) {
        const emailDiv = document.createElement("div");
        const emailText = `${data[i].sender}\n${data[i].subject}`;

        const senderSpan = document.createElement("span");
        senderSpan.textContent = data[i].sender;
        senderSpan.classList.add('sender')

        const subjectSpan = document.createElement("span");
        subjectSpan.textContent = data[i].subject;
        subjectSpan.classList.add('subject')


        const timestampSpan = document.createElement("span");
        timestampSpan.textContent = data[i].timestamp;

        //emailDiv.textContent = emailText;
        emailDiv.classList.add("email", "border-gray-500", "border-x", "border-y", "p-2", "hover:border-spectrum-h2", "hover:shadow-2xl", 'relative', /* 'bg-gray-900', */'bg-white', 'text-black');
        if (data[i].read === true) {
          emailDiv.classList.remove(/* "bg-gray-900" */'bg-white', 'text-black');
          emailDiv.classList.add("bg-gray-800", 'text-white')
        } else {
          emailDiv.classList.add("font-bold");
        }
        timestampSpan.classList.add("timestamp");
        emailDiv.style.cursor = "pointer";

        emailDiv.appendChild(senderSpan);
        emailDiv.appendChild(subjectSpan);
        emailDiv.appendChild(timestampSpan);

        /* const anchorTag = document.createElement("a");
        anchorTag.href = `/emails/${data[i].id}`;
        anchorTag.appendChild(emailDiv); */
        emailDiv.addEventListener("click", () => {
          fetch(`/emails/${data[i].id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
            .then(() => {
              return fetch(`/emails/${data[i].id}`, {
                method: "GET"
              });
            })
            .then(response => {
              return response.json();
            })
            // Create a new div to display the email contents
            .then(data => {
              // Hide the other 2 views
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'none';
              document.querySelector('#email-single-view').style.display = 'block';

              const emailsViewSingle = document.querySelector("#email-single-view");
              emailsViewSingle.classList.add('text-white')

              while (emailsViewSingle.firstChild) {
                emailsViewSingle.removeChild(emailsViewSingle.firstChild);
              }

              emailsViewSingle.innerHTML = `<h3> ${data.subject}</h3>`;


              //const singleEmail = document.createElement("div");

              const fromLine = document.createElement("div");
              fromLine.textContent = `From: ${data.sender}`;
              const toLine = document.createElement("div");
              toLine.textContent = `To: ${data.recipients}`;
              const bodyLine = document.createElement("div");
              bodyLine.textContent = data.body;
              bodyLine.style.whiteSpace = "pre-wrap";
              bodyLine.classList.add("mb-10")


              const timestampSpanSingle = document.createElement("div");

              timestampSpanSingle.textContent = `Sent on: ${data.timestamp}`;



              emailsViewSingle.appendChild(timestampSpanSingle);

              emailsViewSingle.appendChild(fromLine);
              emailsViewSingle.appendChild(toLine);
              emailsViewSingle.appendChild(bodyLine);
              const BodyDiv = document.createElement("div");
              BodyDiv.appendChild(bodyLine)
              BodyDiv.classList.add("border-x", "border-y", 'rounded-2xl', 'mb-5', "px-2", "py-4", 'shadow-2xl', 'mt-12')
              emailsViewSingle.appendChild(BodyDiv)

              const userEmail = document.querySelector('#user-mail').dataset.user;
              //console.log(userEmail); // Output: the value of the data-user attribute
              if (data.sender !== userEmail) {
                const archive = document.createElement('btn')
                archive.style.cursor = "pointer";
                archive.classList.add("bg-white", "hover:bg-spectrum-h3", "text-gray-800", "font-semibold", "py-2", "px-6", "border", "border-gray-400", "rounded-3xl", "mr-5", "shadow", "mt-10");
                if (data.archived === false) {
                  archive.textContent = "Archive";
                  archive.addEventListener("click", () => {
                    console.log("Archived")
                    fetch(`/emails/${data.id}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                        archived: true
                      })
                    });
                    // Make it refresh the inbox, maybe make a new get request
                    // Used a refresh for now and it works, im not sure how to make the load_mailbox('inbox') also refresh
                    localStorage.setItem('message', 'This email has been archived');

                    location.reload();



                    //load_mailbox('inbox')
                  });
                } else {
                  archive.textContent = "Restore";
                  archive.addEventListener("click", () => {
                    console.log("Restored")
                    fetch(`/emails/${data.id}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                        archived: false
                      })
                    });
                    localStorage.setItem('message', 'This email has been restored');

                    location.reload();

                    //load_mailbox('inbox')
                  });
                };
                emailsViewSingle.appendChild(archive)
              }
              const reply = document.createElement('btn')
              reply.style.cursor = "pointer";
              reply.classList.add("bg-white", "hover:bg-spectrum-h3", "text-gray-800", "font-semibold", "py-2", "px-6", "border", "border-gray-400", "rounded-3xl", "shadow", "mt-10");
              reply.textContent = 'Reply'

              reply.addEventListener("click", () => {
                console.log(`Reply to ${data.sender}`)
                compose_email()
                document.querySelector('#compose-recipients').value = `${data.sender}`;
                if (data.subject.includes("Re:")) {
                  document.querySelector('#compose-subject').value = data.subject;
                } else {
                  document.querySelector('#compose-subject').value = `Re: ${data.subject}`;
                }
                document.querySelector('#compose-body').value = `\n \n \n\n\n\n -------------------------------------------------- \n On ${data.timestamp} ${data.sender} wrote: \n ${data.body}`;
              });


              emailsViewSingle.appendChild(reply)



              //emailsViewSingle.appendChild(singleEmail);

              console.log(data);
            });
        });
        emailsView.appendChild(emailDiv);
      }
      // handle other mailbox types if needed
    })
    .catch(error => {
      console.log('Error:', error);
    });

}