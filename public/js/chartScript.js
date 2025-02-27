document.addEventListener("DOMContentLoaded", function () {
    const incomeInput = document.getElementById("income");
    const needsInput = document.getElementById("needsRatio");
    const wantsInput = document.getElementById("wantsRatio");
    const savingsInput = document.getElementById("savingsRatio");
    const errorMsg = document.createElement("p"); // Create an error message element
    errorMsg.style.color = "red";
    errorMsg.style.fontWeight = "bold";
    errorMsg.style.display = "none"; // Initially hidden
    document.getElementById("calculator").appendChild(errorMsg); // Add it below the inputs

    // Load stored values from localStorage
    incomeInput.value = localStorage.getItem("income") || "";
    needsInput.value = localStorage.getItem("needsRatio") || "50";
    wantsInput.value = localStorage.getItem("wantsRatio") || "30";
    savingsInput.value = localStorage.getItem("savingsRatio") || "20";

    const ctx = document.getElementById("budgetChart").getContext("2d");

    let chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Needs", "Wants", "Savings"],
            datasets: [{
                data: [parseFloat(needsInput.value), parseFloat(wantsInput.value), parseFloat(savingsInput.value)],
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });

    function updateChart() {
        const income = parseFloat(incomeInput.value) || 0;
        const needsRatio = parseFloat(needsInput.value) || 0;
        const wantsRatio = parseFloat(wantsInput.value) || 0;
        const savingsRatio = parseFloat(savingsInput.value) || 0;

        // Check if the sum is 100
        const totalRatio = needsRatio + wantsRatio + savingsRatio;
        if (totalRatio !== 100) {
            errorMsg.innerText = "Error: Needs, Wants, and Savings must add up to 100%!";
            errorMsg.style.display = "block";
            return; // Stop execution if validation fails
        } else {
            errorMsg.style.display = "none"; // Hide error if valid
        }

        // Calculate values based on income
        const needs = (income * (needsRatio / 100)).toFixed(2);
        const wants = (income * (wantsRatio / 100)).toFixed(2);
        const savings = (income * (savingsRatio / 100)).toFixed(2);

        // Update the chart
        chart.data.datasets[0].data = [needs, wants, savings];
        chart.update();

        // Store values in localStorage
        localStorage.setItem("income", incomeInput.value);
        localStorage.setItem("needsRatio", needsInput.value);
        localStorage.setItem("wantsRatio", wantsInput.value);
        localStorage.setItem("savingsRatio", savingsInput.value);
    }

    // Update the chart and validate when inputs change
    incomeInput.addEventListener("input", updateChart);
    needsInput.addEventListener("input", updateChart);
    wantsInput.addEventListener("input", updateChart);
    savingsInput.addEventListener("input", updateChart);
});
