document.addEventListener("DOMContentLoaded", function () {
    const needs = parseFloat(document.getElementById("needs").textContent);
    const wants = parseFloat(document.getElementById("wants").textContent);
    const savings = parseFloat(document.getElementById("savings").textContent);

    const ctx = document.getElementById("budgetChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Needs (50%)", "Wants (30%)", "Savings (20%)"],
            datasets: [{
                data: [needs, wants, savings],
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true, 
                    position: "bottom",  // Moves labels below the chart
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
});