let currentUser = null;

/**
 * Wyświetla komunikat w obszarze #message.
 * @param {string} text Treść komunikatu.
 * @param {string} type Typ komunikatu ('info', 'success', 'error').
 */
function showMessage(text, type = "info") {
	const messageDiv = document.getElementById("message");
	messageDiv.innerText = text;
	messageDiv.className = type;
	setTimeout(() => {
		messageDiv.innerText = "";
		messageDiv.className = "";
	}, 5000);
}

/**
 * Wyświetla powiadomienie w obszarze #notification.
 * @param {string} text Treść powiadomienia.
 */
function showNotification(text) {
	const notifDiv = document.getElementById("notification");
	notifDiv.innerText = text;
	setTimeout(() => {
		notifDiv.innerText = "";
	}, 5000);
}

/**
 * Aktualizuje widoczność pozycji w menu oraz informację o zalogowanym użytkowniku.
 */
function renderNav() {
	if (currentUser) {
		document.getElementById("nav-profile").style.display = "inline";
		document.getElementById("nav-cars").style.display = "inline";
		document.getElementById("nav-buy").style.display = "inline";
		document.getElementById("nav-logout").style.display = "inline";
		document.getElementById("nav-login").style.display = "none";
		document.getElementById("nav-register").style.display = "none";

		document.getElementById(
			"user-info"
		).innerText = `Zalogowany jako: ${currentUser.username} | Rola: ${currentUser.role} | Saldo: ${currentUser.balance}`;
	} else {
		document.getElementById("nav-profile").style.display = "none";
		document.getElementById("nav-cars").style.display = "none";
		document.getElementById("nav-buy").style.display = "none";
		document.getElementById("nav-logout").style.display = "none";
		document.getElementById("nav-login").style.display = "inline";
		document.getElementById("nav-register").style.display = "inline";

		document.getElementById("user-info").innerText = "Nie jesteś zalogowany";
	}
}

/**
 * Sprawdza, czy użytkownik jest zalogowany poprzez wywołanie endpointu /users.
 * Dla zwykłych userów zwracany jest obiekt, a dla admina (ze względu na uprawnienia)
 * – tablica wszystkich użytkowników. W tym przypadku wybieramy obiekt admina.
 */
async function checkAuth() {
	try {
		const res = await fetch("http://localhost:3000/me", {
			method: "GET",
			credentials: "include",
		});
		if (res.status === 200) {
			const data = await res.json();
			if (Array.isArray(data)) {
				// Założenie: konto admina znajduje się wśród użytkowników i ma role 'admin'
				currentUser = data.find((u) => u.role === "admin") || null;
			} else {
				currentUser = data;
			}
		} else {
			currentUser = null;
		}
	} catch (err) {
		currentUser = null;
	}
	renderNav();
}

/**
 * Pokazuje wskazany widok (sekcję) i ukrywa pozostałe.
 * @param {string} viewId ID widoku do pokazania.
 */
function showView(viewId) {
	const views = document.querySelectorAll(".view");
	views.forEach((view) => {
		view.style.display = "none";
	});
	const activeView = document.getElementById(viewId);
	if (activeView) {
		activeView.style.display = "block";
	}
}

/**
 * Ładuje dane profilu aktualnie zalogowanego użytkownika.
 */
async function loadProfile() {
	try {
		const res = await fetch("http://localhost:3000/me");
		if (!res.ok) {
			throw new Error("Unauthorized");
		}
		const user = await res.json();
		currentUser = user;

		// profil uzytkownika
		const profileDiv = document.getElementById("profile-info");
		profileDiv.innerHTML = `
			<p><strong>username:</strong> ${user.username}</p>
			<p><strong>balance:</strong> ${user.balance}</p>
			<button id="edit-profile-btn">Edit profile</button>
		`;
		document
			.getElementById("edit-profile-btn")
			.addEventListener("click", () => {
				showEditForm(user);
			});

		// sekcja admina
		if (user.role === "admin") {
			const usersRes = await fetch("http://localhost:3000/users", {
				credentials: "include",
			});
			if (!usersRes.ok) {
				throw new Error("Error getting user list");
			}

			const users = await usersRes.json();
			console.log("users list", users);
			const userListDiv = document.getElementById("user-list");
			userListDiv.innerHTML = `
				<h3>All users</h3>
				<ul>
					${users
						.map(
							(u) => `
						<li>
							${u.username} | ${u.role} | ${u.balance}
							<button class="edit-user-btn" data-id="${u.id}">Edit</button>
							<button class="delete-user-btn" data-id="${u.id}">Delete</button>
						</li>
					`
						)
						.join("")}
				</ul>
			`;

			document.querySelectorAll(".edit-user-btn").forEach((btn) =>
				btn.addEventListener("click", (e) => {
					const id = e.target.dataset.id;
					const userToEdit = users.find((u) => u.id === id);
					if (userToEdit) {
						showEditForm(userToEdit);
					}
				})
			);
			document.querySelectorAll(".delete-user-btn").forEach((btn) =>
				btn.addEventListener("click", async (e) => {
					const id = e.target.dataset.id;
					if (confirm("Are you sure you want to delete user?")) {
						await deleteUser(id);
						loadProfile();
					}
				})
			);
		}
	} catch (err) {
		showMessage("Błąd przy pobieraniu profilu", "error");
	}
}

// Obsługa funkcji loadProfile()
/**
 * Prompt obsługi edycji user-a
 */
function showEditForm(user) {
	let username = user.username;
	let password = undefined;
	let role = user.role;
	let balance = user.balance;

	if (currentUser.id === user.id) {
		username = prompt("New username", user.username) || user.username;
		const newPassword = prompt(
			"New password (leave empty to keep unchanged)",
			""
		);
		if (newPassword && newPassword.trim() !== "") {
			password = newPassword;
		}
	}

	if (currentUser.role === "admin" && currentUser.id !== user.id) {
		username = prompt("New username", username) || user.username;
		role = prompt("New role (admin/user)", user.role) || user.role;
		balance = Number(prompt("New balance", user.balance)) || user.balance;
	}

	const data = { username, role, balance };
	if (password) {
		data.password = password;
	}

	updateUser(user.id, data);
}
/**
 * Update user-a
 */
async function updateUser(id, data) {
	try {
		const res = await fetch(`http://localhost:3000/users/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Update error");
		showNotification("User successfully updated");
		loadProfile();
	} catch (error) {
		console.error(error);
		showMessage("Failed to update user", "error");
	}
}
/**
 * Delete user - admin can delete a user
 */
async function deleteUser(id) {
	try {
		const res = await fetch(`http://localhost:3000/users/${id}`, {
			method: "DELETE",
			credentials: "include",
		});
	} catch (error) {
		console.error(error);
		showMessage("Failed to delete user", "error");
	}
}

/**
 * Ładuje listę samochodów i wyświetla je w sekcji #cars-list.
 */
async function loadCars() {
	try {
		const res = await fetch("http://localhost:3000/cars");
		if (res.status === 200) {
			const cars = await res.json();
			const divEl = document.getElementById("cars-list");

			if (cars.length === 0) {
				return (divEl.innerHTML = "Brak samochodów.");
			}

			let html = `
				<table class='car-table' border='1' cellspacing='2' cellpadding='5'>
					<thead>
						<tr>
							<th>Id</th>
							<th>Model</th>
							<th>Price</th>
							<th>Owner</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
			`;

			cars.forEach((car) => {
				html += `
				<tr class='car-row'>
					<td>${car.id}</td>
					<td>${car.model}</td>
					<td>${car.price}</td>
					<td>${car.ownerId || "-"}</td>
				`;

				if (currentUser.role === "admin") {
					html += `
					<td>
						<button class='edit-btn' data-id='${car.id}'>Edit</button>
						<button class='delete-btn' data-id='${car.id}'>Usuń</button>
					</td>
					`;
				}

				html += `</td></tr>`;
			});

			html += `</tbody></table>`;
			divEl.innerHTML = html;

			if (currentUser.role === "admin") {
				document.querySelectorAll(".edit-btn").forEach((btn) => {
					btn.addEventListener("click", () => {
						editCar(btn.dataset.id, cars);
					});
				});
				document.querySelectorAll(".delete-btn").forEach((btn) => {
					btn.addEventListener("click", async () => {
						await deleteCar(btn.dataset.id, cars);
					});
				});
			}
		}
	} catch (err) {
		showMessage("Błąd przy pobieraniu samochodów", "error");
	}
}

/**
 * Funkcja edycji samochodu.
 */
async function editCar(carId, cars) {
	try {
		const car = cars.find((c) => c.id === carId);
		if (!car) {
			return showMessage("Car not found", "error");
		}

		const modelUpdated = prompt("Enter new model");
		const priceUpdated = Number(prompt("Enter new price"));
		// if (!modelUpdated || isNaN(priceUpdated)) {
		// 	return showMessage("Wrong data", "error");
		// }

		const res = await fetch(`http://localhost:3000/cars/${carId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ model: modelUpdated, price: priceUpdated }),
		});
		const data = await res.json();

		if (res.status === 200) {
			showMessage(`Car updated`, "success");
			loadCars();
		} else {
			showMessage(data.error || "Error during edditing", "error");
		}
	} catch (error) {
		showMessage("Connection error when editing", "error");
	}
}

/**
 * Funkcja usuwania samochodu.
 */
async function deleteCar(carId, cars) {
	if (!confirm("Are you sure?")) {
		return;
	}

	try {
		const car = cars.find((c) => c.id === carId);
		if (!car) {
			return showMessage("Car not found", "error");
		}

		const res = await fetch(`http://localhost:3000/cars/${carId}/delete`, {
			method: "DELETE",
		});
		const data = await res.json();

		if (res.status === 200) {
			showMessage(`Car deleted!`, "success");
			loadCars();
		} else {
			showMessage(data.error || "Error during deleting", "error");
		}
	} catch (error) {
		showMessage("Connection error when deleting", "error");
	}
}

/**
 * Ustawia wszystkie nasłuchiwacze zdarzeń dla formularzy oraz routingu.
 */
function setupEventListeners() {
	// Routing – zmiana widoku po zmianie fragmentu URL
	window.addEventListener("hashchange", route);
	route(); // inicjalizacja

	// Formularz logowania
	const loginForm = document.getElementById("loginForm");
	if (loginForm) {
		loginForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const username = document.getElementById("loginUsername").value;
			const password = document.getElementById("loginPassword").value;
			const res = await fetch("http://localhost:3000/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			const data = await res.json();
			if (res.status === 200) {
				showMessage("Zalogowano pomyślnie", "success");
				await checkAuth();
				window.location.hash = "#home";
			} else {
				showMessage(data.error || "Błąd logowania", "error");
			}
		});
	}

	// Formularz rejestracji
	const registerForm = document.getElementById("registerForm");
	if (registerForm) {
		registerForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const username = document.getElementById("regUsername").value;
			const password = document.getElementById("regPassword").value;
			const res = await fetch("http://localhost:3000/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			const data = await res.json();
			if (res.status === 201) {
				showMessage(
					"Rejestracja powiodła się, możesz się zalogować",
					"success"
				);
				window.location.hash = "#login";
			} else {
				showMessage(data.error || "Błąd rejestracji", "error");
			}
		});
	}

	// Formularz usunięcia profilu
	const profileDelete = document.getElementById("profile-delete");
	if (profileDelete) {
		profileDelete.addEventListener("click", async () => {
			if (!confirm("Are you sure you want to delete your account?")) {
				return;
			}

			try {
				const res = await fetch(`http://localhost:3000/users/delete`, {
					method: "DELETE",
					credentials: "include",
				});
				const data = await res.json();
				if (data.succes) {
					showMessage("Profile deleted", "success");
					checkAuth();
					renderView("home");
				} else {
					showMessage(data.message || "Error while deleting account");
				}
			} catch (error) {
				console.error("Error while deleting", error);
				showMessage("A network or server error occurred");
			}
		});
	}

	// Formularz dodawania samochodu
	const addCarForm = document.getElementById("addCarForm");
	if (addCarForm) {
		addCarForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const model = document.getElementById("carModel").value;
			const price = parseFloat(document.getElementById("carPrice").value);
			const res = await fetch("http://localhost:3000/cars", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ model, price }),
				credentials: "include",
			});
			const data = await res.json();
			if (res.status === 201) {
				showMessage("Samochód dodany", "success");
				e.target.reset();
				loadCars();
			} else {
				showMessage(data.error || "Błąd dodawania samochodu", "error");
			}
		});
	}

	// Formularz zakupu samochodu
	const buyCarForm = document.getElementById("buyCarForm");
	if (buyCarForm) {
		buyCarForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const carId = document.getElementById("buyCarId").value;

			try {
				const res = await fetch(`http://localhost:3000/cars/${carId}/buy`, {
				method: "POST",
				credentials: "include",
				});

				const data = await res.json();

				if (res.ok) {
				showMessage("Samochód zakupiony", "success");
				await loadCars();
				await loadProfile()
				// await checkAuth();
				} else {
				showMessage(data.error || "Błąd zakupu samochodu", "error");
				}
			} catch (error) {
				console.error(err);
      	showMessage("Błąd sieci", "error");
			}
		});
	}
}

/**
 * Prosty router – na podstawie fragmentu adresu URL (hash) wyświetla odpowiedni widok.
 * Specjalnie obsługujemy #logout, aby "wylogować" użytkownika (symulacja).
 */
async function route() {
	const hash = window.location.hash || "#home";
	const viewId = hash.substring(1) + "-view";

	if (hash === "#logout") {
		const res = await fetch("http://localhost:3000/logout", {
			method: "GET",
			credentials: "include",
		});
		const data = await res.json()
		currentUser = null;
		renderNav();
		showMessage("Wylogowano");
		window.location.hash = "#home";
		return;
	}

	showView(viewId);
	if (viewId === "profile-view") {
		loadProfile();
	}
	if (viewId === "cars-view") {
		loadCars();
	}
}

/**
 * Ustawia nasłuchiwanie Server-Sent Events, które wyświetlają powiadomienia o zdarzeniach (np. zakupie samochodu).
 */
function setupSSE() {
	const evtSource = new EventSource("/sse");
	evtSource.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		showNotification(
			`SSE: ${msg.event} - Car ID: ${msg.carId}, Buyer ID: ${msg.buyerId}`
		);
	};
}

window.addEventListener("load", async () => {
	await checkAuth();
	setupEventListeners();
	setupSSE();
});
