const studentID = "M00912287";
const baseRoute = `/${studentID}`;

$(document).ready(function() {
    //handle user registration
    $('#register-form').submit(function(event) {
        event.preventDefault();

        
        var username = $('#register-username').val();
        var email = $('#register-email').val();
        var password = $('#register-password').val();

       
        var userData = {
            username: username,
            email: email,
            password: password
        };

        
        $.ajax({
            type: 'POST',
            url: `${baseRoute}/register`, 
            data: JSON.stringify(userData),
            contentType: 'application/json',
            success: function(response) {
                alert('Registration successful! You can now login.');
                $('#register-form')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
                alert('Registration failed. Please try again later.');
            }
        });
    });
});

 //Handle user login
$('#login-form').submit(function(event) {
    event.preventDefault();
    var email = $('#login-email').val();
    var password = $('#login-password').val();
    var loginData = {
        email: email,
        password: password
    };
    // Send an AJAX POST request to login
    $.ajax({
        type: 'POST',
        url: `${baseRoute}/login`,
        data: JSON.stringify(loginData),
        contentType: 'application/json',
        success: function(response) {
            alert('Login successful! Welcome ' + response.user.username);
            window.location.href = '/M00912287?username=' + response.user.username;
            // Set token in localStorage
            localStorage.setItem("token", response.token);
            $('#logout-btn').show();
            $('#add-r-btn').show();
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText);
            alert('Login failed. Please check your email and password.');
        }
    });
});

//Handle recipe addition
$('#add-recipe-form').submit(function(event) {
    event.preventDefault();
    var title = $('#recipe-title').val();
    var ingredients = $('#recipe-ingredients').val();
    var instructions = $('#recipe-instructions').val();
    var image = $('#recipe-image')[0].files[0]; 
    // FormData object to send both text and file data
    var formData = new FormData();
    formData.append('title', title);
    formData.append('ingredients', ingredients);
    formData.append('instructions', instructions);
    formData.append('image', image);
    // Send an AJAX POST request to add the recipe
    $.ajax({
        type: 'POST',
        url: `${baseRoute}/recipes`,
        data: formData,
        contentType: false, //Prevent jQuery from setting Content-Type
        processData: false, //Prevent jQuery from processing data
        success: function(response) {
            alert('Recipe added successfully!');
            $('#add-recipe-form')[0].reset();
            location.reload();
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText);
            alert('Failed to add recipe. Please try again later.');
        }
    });
});

//fetch and display recipes
function displayRecipes() {
    $.ajax({
        type: 'GET',
        url: `${baseRoute}/recipes`,
        success: function(recipes) {
            $('#recipe-grid').empty(); // Clear previous recipe cards
            recipes.forEach(function(recipe) {
                // Split ingredients and instructions into arrays
                var ingredientsList = recipe.ingredients.split('\n');
                var instructionsList = recipe.instructions.split('\n');
                
                var recipeCard = `
                    <div class="recipe-card">
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <h3>${recipe.title}</h3>
                        <p><strong>Ingredients:</strong></p>
                        <ul>`;
                
                ingredientsList.forEach(function(ingredient) {
                    recipeCard += `<li>${ingredient}</li>`;
                });
                
                recipeCard += `</ul>
                        <p><strong>Instructions:</strong></p>
                        <ol>`;
                
                instructionsList.forEach(function(instruction) {
                    var splitInstruction = instruction.split('. ');
                    if (splitInstruction.length > 1) {
                        recipeCard += `<li>${splitInstruction[0]}. </li>`;
                        for (var i = 1; i < splitInstruction.length; i++) {
                            recipeCard += `<li>${i}. ${splitInstruction[i]}</li>`;
                        }
                    } else {
                        recipeCard += `<li>${instruction}</li>`;
                    }
                });
                
                recipeCard += `</ol>
                    </div>`;
                
                $('#recipe-grid').append(recipeCard); // Append recipe card to grid
            });
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText);
            alert('Failed to fetch recipes. Please try again later.');
        }
    });     
}

// Call displayRecipes on page load
$(document).ready(function() {
    displayRecipes();
});

$("#add-r-btn").click(function() {
    $("#add-recipe-section").show();
    $('html, body').animate({
        scrollTop: $("#add-recipe-section").offset().top
    }, 1000);
});
$("#login-btn").click(function() {
    $('html, body').animate({
        scrollTop: $("#login-section").offset().top
    }, 1000);
});

$("#register-btn").click(function() {
    $('html, body').animate({
        scrollTop: $("#register-section").offset().top
    }, 1000);
});

// Automatically set tokens when the user is logged in
const token = localStorage.getItem("token");
if (token) {
    $('#logout-btn').show();
   
} else {
    $('#logout-btn').hide();
    
}
