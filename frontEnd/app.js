console.log("WORKING")

let API_URL = 'http://localhost:3000';

// buttons
const getAllUsersBtn = document.getElementById('getAllUsersBtn');
const itemA = document.getElementById('item-a');
const allUsersUl = document.createElement('ul');


async function makeGetRequest(endURL) {
  let resp = await axios.get(`${API_URL}${endURL}`);
  let data = resp.data
  console.log(data)
  return data.users;
}

getAllUsersBtn.addEventListener("click", async function() {
    let users = await makeGetRequest('/users');

    for (let i=0; i< users.length; i++) {
        let li = document.createElement('li');
        li.innerText = `${JSON.stringify(users[i].username)} x`
        allUsersUl.append(li)
    }

    if (allUsersUl.classList.contains('appended')) {
        return;
    } else {
        itemA.append(allUsersUl)
        allUsersUl.classList.add('append')
    }

    console.log("done!!!")
  });



// makeGetRequest('/users');