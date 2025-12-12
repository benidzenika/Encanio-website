// --- მუდმივი key localStorage-სთვის ---
const STORAGE_KEY = "simple-task-manager-tasks";

// --- მასივი, სადაც ვინახავთ დავალებებს ---
let tasks = [];

// თუ null -> ვქმნით ახალს, თუ რიცხვია -> ვაახლებთ არსებულს
let editingTaskId = null;

// --- DOM ელემენტები ---
const loadingEl = document.getElementById("loading");
const messageEl = document.getElementById("message");

const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("dueDate");
const statusInput = document.getElementById("status");

const filterPriority = document.getElementById("filterPriority");
const filterStatus = document.getElementById("filterStatus");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

// --- დამხმარე ფუნქციები ---

// Loading-ის ჩვენება/დამალვა
function setLoading(isLoading) {
  loadingEl.style.display = isLoading ? "block" : "none";
}

// მესიჯის ჩვენება (წარმატება/შეცდომა)
function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className =
    "messages " + (isError ? "message-error" : "message-success");

  if (text) {
    // 3 წამში გაქრეს ავტომატურად
    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "messages";
    }, 3000);
  }
}

// setTimeout-ით "ფსევდო API" დაგვიანება
function withDelay(action) {
  setLoading(true);
  setTimeout(() => {
    try {
      action();
    } catch (err) {
      console.error(err);
      showMessage("შეცდომა ოპერაციის დროს: " + err.message, true);
    } finally {
      setLoading(false);
    }
  }, 500); // 0.5 წამის დაგვიანება
}

// --- localStorage ფუნქციები ---

function saveTasks() {
  try {
    const json = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (err) {
    // თუ მოხდა შეცდომა, ვთავაზობთ retry-ს
    showMessage("ვერ შევინახე localStorage-ში: " + err.message, true);
    const wantRetry = confirm("მოხდა შეცდომა შენახვისას. გინდა სცადო თავიდან?");
    if (wantRetry) {
      saveTasks();
    }
  }
}

function loadTasks() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      tasks = [];
    } else {
      tasks = JSON.parse(json) || [];
    }
  } catch (err) {
    showMessage("ვერ წავიკითხე localStorage-დან: " + err.message, true);
    tasks = [];
  }
}

// --- UI განახლება (Read) ---
// ორად გვყოფს: Pending და Done კონტეინერები
function renderTasks() {
  const pendingList = document.getElementById("pendingList");
  const doneList = document.getElementById("doneList");

  pendingList.innerHTML = "";
  doneList.innerHTML = "";

  const pFilter = filterPriority.value;
  const sFilter = filterStatus.value;

  const filtered = tasks.filter((task) => {
    const okPriority = !pFilter || task.priority === pFilter;
    const okStatus = !sFilter || task.status === sFilter;
    return okPriority && okStatus;
  });

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No tasks found.";
    pendingList.appendChild(li);
    return;
  }

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const titleDiv = document.createElement("div");
    titleDiv.textContent =
      task.title + (task.status === "done" ? " (Done)" : "");
    li.appendChild(titleDiv);

    const meta = document.createElement("div");
    meta.style.fontSize = "12px";
    meta.style.color = "#555";
    meta.textContent = `Priority: ${task.priority} | Due: ${
      task.dueDate || "N/A"
    }`;
    li.appendChild(meta);

    const btns = document.createElement("div");

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent =
      task.status === "done" ? "Mark Pending" : "Mark Done";
    toggleBtn.onclick = () => toggleStatus(task.id);
    btns.appendChild(toggleBtn);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => startEditTask(task.id);
    btns.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteTask(task.id);
    btns.appendChild(deleteBtn);

    li.appendChild(btns);

    // ჩაყრა შესაბამის კონტეინერში
    if (task.status === "done") {
      doneList.appendChild(li);
    } else {
      pendingList.appendChild(li);
    }
  });
}

// --- CRUD ოპერაციები ---

// Create ან Update (form submit-ზე)
function handleFormSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    showMessage("სათაური სავალდებულოა", true);
    return;
  }

  const description = descriptionInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dueDateInput.value;
  const status = statusInput.value;

  withDelay(() => {
    if (editingTaskId === null) {
      // CREATE
      const newTask = {
        id: Date.now(), // მარტივი უნიკალური აიდი
        title,
        description,
        priority,
        dueDate,
        status,
      };
      tasks.push(newTask);
      showMessage("Task წარმატებით შეიქმნა");
    } else {
      // UPDATE
      const index = tasks.findIndex((t) => t.id === editingTaskId);
      if (index !== -1) {
        tasks[index].title = title;
        tasks[index].description = description;
        tasks[index].priority = priority;
        tasks[index].dueDate = dueDate;
        tasks[index].status = status;
        showMessage("Task წარმატებით განახლდა");
      }
    }

    saveTasks();
    resetForm();
    renderTasks();
  });
}

// Edit-ის დაწყება (ფორმის შევსება არსებული task-ის მონაცემებით)
function startEditTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editingTaskId = id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  priorityInput.value = task.priority;
  dueDateInput.value = task.dueDate;
  statusInput.value = task.status;
}

// ფორმის გასუფთავება (edit → create რეჟიმზე დაბრუნება)
function resetForm() {
  editingTaskId = null;
  taskForm.reset();
  priorityInput.value = "medium";
  statusInput.value = "pending";
}

// Delete
function deleteTask(id) {
  const ok = confirm("ნამდვილად გინდა ამ task-ის წაშლა?");
  if (!ok) return;

  withDelay(() => {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
    showMessage("Task წაიშალა");
  });
}

// Status toggle (pending <-> done)
function toggleStatus(id) {
  withDelay(() => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.status = task.status === "done" ? "pending" : "done";
    saveTasks();
    renderTasks();
    showMessage("Task-ის სტატუსი განახლდა");
  });
}

// --- ფილტრები ---
filterPriority.addEventListener("change", renderTasks);
filterStatus.addEventListener("change", renderTasks);

clearFiltersBtn.addEventListener("click", () => {
  filterPriority.value = "";
  filterStatus.value = "";
  renderTasks();
});

// --- Form events ---
taskForm.addEventListener("submit", handleFormSubmit);

// --- Initial load (window.onload) ---
window.addEventListener("DOMContentLoaded", () => {
  withDelay(() => {
    loadTasks();
    renderTasks();
    showMessage("Tasks წარმატებით ჩაიტვირთა");
  });
});
