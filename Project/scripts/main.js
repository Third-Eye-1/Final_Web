const apiUrl = "https://656957d8de53105b0dd6ed65.mockapi.io/api/aha";

document.addEventListener('DOMContentLoaded', async () => {
    const defaultFilterType = 'all';

    await filterTasks(defaultFilterType);
});


let editingIndex = null;
let currentUser = null;

const loggedInUserId = localStorage.getItem('loggedInUserId');
const loggedInUserName = localStorage.getItem('loggedInUserName');
const userNameElement = document.getElementById('userName');
userNameElement.textContent = `Welcome, ${loggedInUserName}!`;

const successMessageElement = document.getElementById('successMessage');

function Task(name, description, deadline, completed = false) {
    this.name = name;
    this.description = description;
    this.deadline = deadline;
    this.completed = completed;
}

async function saveTask() {
    const taskName = document.getElementById('taskNameInput').value;
    const taskDescription = document.getElementById('taskDescriptionInput').value;
    const taskDeadline = document.getElementById('taskDeadlineInput').value;

    if (taskName.trim() === '' || taskDescription.trim() === '' || taskDeadline.trim() === '') {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/user/${loggedInUserId}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                taskname: taskName,
                description: taskDescription,
                deadline: taskDeadline,
                userId: loggedInUserId,
            }),
        });

        if (response.ok) {
            resetInputFields();
            
            filterTasks('all');
            selectFilterButton('all');
            
            displaySuccessMessage('Task saved successfully.', true);
        } else {
            const errorMessage = await response.text();
            console.error("Save task failed:", errorMessage);
            displaySuccessMessage(errorMessage, false);
        }
    } catch (error) {
        console.error("Error during save task:", error);
        displaySuccessMessage("An error occurred during save task.", false);
    }
}




async function filterTasks(filterType = 'all') {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    try {
        const response = await fetch(`${apiUrl}/user/${loggedInUserId}/tasks`);
        const tasksResponse = await response.json();

        if (!Array.isArray(tasksResponse)) {
            console.error("Invalid tasks data:", tasksResponse);
            displaySuccessMessage("An error occurred while fetching tasks.", false);
            return;
        }

        tasks = tasksResponse;

        setFilterButtonStyle(`${filterType}TasksBtn`);

        tasks.forEach(task => {
            if ((filterType === 'all') ||
                (filterType === 'completed' && task.isCompleted) ||
                (filterType === 'active' && !task.isCompleted)) {
                const newRow = taskList.insertRow();
                newRow.insertCell(0).innerText = task.taskname;
                newRow.insertCell(1).innerText = task.description;
                newRow.insertCell(2).innerText = task.deadline;
                newRow.insertCell(3).innerHTML = `<input type="checkbox" ${task.isCompleted ? 'checked' : ''} onclick="toggleCompletion(this)">`;
                newRow.insertCell(4).innerHTML = '<button onclick="editTask(this)">Edit</button> <button onclick="deleteTask(this)">Delete</button>';
            }
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        displaySuccessMessage("An error occurred while fetching tasks.", false);
    }

    setFilterButtonStyle(`${filterType}TasksBtn`);
}



async function toggleCompletion(checkbox) {
    const row = checkbox.parentNode.parentNode;
    const index = row.rowIndex - 1;

    try {
        const response = await fetch(`${apiUrl}/user/${loggedInUserId}/tasks/${tasks[index].task_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                isCompleted: checkbox.checked,
            }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Toggle completion failed:", errorMessage);
            displaySuccessMessage(errorMessage, false);
        }
    } catch (error) {
        console.error("Error during toggle completion:", error);
        displaySuccessMessage("An error occurred during toggle completion.", false);
    }

    filterTasks('all');
    selectFilterButton('all');
}



async function editTask(button) {
    const row = button.parentNode.parentNode;
    const index = row.rowIndex - 1; 

    document.getElementById('taskNameInput').value = tasks[index].taskname;
    document.getElementById('taskDescriptionInput').value = tasks[index].description;
    document.getElementById('taskDeadlineInput').value = tasks[index].deadline;

    const currentTaskId = tasks[index].task_id;

    row.parentNode.removeChild(row);


    editingIndex = index;

    saveTask = async () => {
        const taskName = document.getElementById('taskNameInput').value;
        const taskDescription = document.getElementById('taskDescriptionInput').value;
        const taskDeadline = document.getElementById('taskDeadlineInput').value;

        if (taskName.trim() === '' || taskDescription.trim() === '' || taskDeadline.trim() === '') {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/user/${loggedInUserId}/tasks/${currentTaskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    taskname: taskName,
                    description: taskDescription,
                    deadline: taskDeadline,
                    completed: tasks[editingIndex].completed
                }),
            });

            if (response.ok) {
                displaySuccessMessage('Task edited successfully.', true);
            } else {
                const errorMessage = await response.text();
                console.error("Edit task failed:", errorMessage);
                displaySuccessMessage(errorMessage, false);
            }
        } catch (error) {
            console.error("Error during edit task:", error);
            displaySuccessMessage("An error occurred during edit task.", false);
        }

        editingIndex = null;

        resetInputFields();

        filterTasks('all');
        selectFilterButton('all');
    };

    document.getElementById('saveTaskBtn').onclick = saveTask;

    displaySuccessMessage('Editing task. Make changes and click "Save Task".', true);
}


async function deleteTask(button) {
    const row = button.parentNode.parentNode;
    const index = row.rowIndex - 1;

    try {
        const response = await fetch(`${apiUrl}/user/${loggedInUserId}/tasks/${tasks[index].task_id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            displaySuccessMessage('Task deleted successfully.', true);
        } else {
            const errorMessage = await response.text();
            console.error("Delete task failed:", errorMessage);
            displaySuccessMessage(errorMessage, false);
        }
    } catch (error) {
        console.error("Error during delete task:", error);
        displaySuccessMessage("An error occurred during delete task.", false);
    }

    filterTasks('all');
    selectFilterButton('all');
}

function setFilterButtonStyle(selectedButtonId) {
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    filterButtons.forEach(button => {
        if (button.id === selectedButtonId) {
            button.classList.add('selected-filter');
        } else {
            button.classList.remove('selected-filter');
        }
    });
}

function displaySuccessMessage(message) {
    successMessageElement.textContent = message;
    successMessageElement.classList.add('success-message');
    setTimeout(() => {
      successMessageElement.textContent = '';
      successMessageElement.classList.remove('success-message');
    }, 3000);
}

function resetInputFields() {
    document.getElementById('taskNameInput').value = '';
    document.getElementById('taskDescriptionInput').value = '';
    document.getElementById('taskDeadlineInput').value = '';
}

async function fetchAndUpdateTasks() {
    try {
        const response = await fetch(`${apiUrl}/user/${loggedInUserId}/tasks`);
        const tasksResponse = await response.json();

        if (!Array.isArray(tasksResponse)) {
            console.error("Invalid tasks data:", tasksResponse);
            displaySuccessMessage("An error occurred while fetching tasks.", false);
            return;
        }

        tasks = tasksResponse;

        const filterType = getSelectedFilter();
        filterTasks(filterType);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        displaySuccessMessage("An error occurred while fetching tasks.", false);
    }
}
function selectFilterButton(filterType) {
    const filterButton = document.getElementById(`${filterType}TasksBtn`);
    if (filterButton) {
        filterButton.checked = true;
    }
}
