document.addEventListener("DOMContentLoaded", function () {
    const incomeInput = document.getElementById("income");
    const needsInput = document.getElementById("needsRatio");
    const wantsInput = document.getElementById("wantsRatio");
    const savingsInput = document.getElementById("savingsRatio");
    const errorMsg = document.createElement("p");
  
    errorMsg.style.color = "red";
    errorMsg.style.fontWeight = "bold";
    errorMsg.style.display = "none";
    document.getElementById("calculator").appendChild(errorMsg);
  
    const ctx = document.getElementById("budgetChart").getContext("2d");
    let chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Needs", "Wants", "Savings"],
        datasets: [{
          data: [0, 0, 0], // Initially empty, will be updated
          backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom"
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                let dataset = tooltipItem.dataset.data;
                let value = dataset[tooltipItem.dataIndex];
                let label = tooltipItem.label || "";
                return `${label}: ₹${value.toFixed(2)}`;
              }
            }
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
        return;
      } else {
        errorMsg.style.display = "none";
      }
  
      // Calculate values based on income
      const needs = income * (needsRatio / 100);
      const wants = income * (wantsRatio / 100);
      const savings = income * (savingsRatio / 100);
  
      // Update the chart with actual monetary values
      chart.data.datasets[0].data = [needs, wants, savings];
      chart.update();
  
      // Send data to the server to update the database
      // fetch("/planner", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     income,
      //     needsRatio,
      //     wantsRatio,
      //     savingsRatio,
      //     wants,
      //     needs,
      //     savings,
      //   }),
      // })
        // .then((response) => response.json())
        // .then((data) => {
        //   console.log("Success:", data);
        // })
        // .catch((error) => {
        //   console.error("Error:", error);
        // });
    }
  
    // Update the chart and validate when inputs change
    incomeInput.addEventListener("input", updateChart);
    needsInput.addEventListener("input", updateChart);
    wantsInput.addEventListener("input", updateChart);
    savingsInput.addEventListener("input", updateChart);
  
    // Initial chart update
    updateChart();
  });