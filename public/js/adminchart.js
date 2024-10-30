let data1;
$(document).ready(function () {
    $.ajax({
        url: `/api/admin/ordersreportforgraph`,
        type: 'GET',
        success: function (data) {
            data1 = data;
            generatechartitem()
            // getChart(data)
        }
    })
})


function getChart(data, flag) {
    if (flag == 1) {
        myChart.destroy(); // Destroy the existing chart
    }

    const ctx = document.getElementById('myChart');

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Orders',
                data: Object.values(data),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            
        }
    });
}

function generatechartitem(type = "currentyear") {
    if (type == "currentyear" || type == "currentyearbtn") {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let ordersbymonth = {
            Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
        }
        data1.forEach((order) => {
            const dateObject = new Date(order._id);
            if (dateObject.getFullYear() == new Date().getFullYear()) {
                month = labels[dateObject.getMonth()]
                ordersbymonth[month] += order.count;
            }
        })


        if (type == "currentyearbtn") {
            getChart(ordersbymonth, '1')
        } else {
            getChart(ordersbymonth)
        }
    }

    if (type == "daily") {

        function getDaysInCurrentMonth() {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            // Get the last day of the current month
            const lastDayOfMonth = new Date(year, month, 0).getDate();

            return lastDayOfMonth;
        }

        const totaldays = getDaysInCurrentMonth();
        let ordersbyday = {};

        for (let i = 1; i <= totaldays; i++) {
            ordersbyday[i] = 0;
        }

        data1.forEach((order) => {
            const dateObject = new Date(order._id);
            if (dateObject.getFullYear() == new Date().getFullYear()) {
                ordersbyday[dateObject.getDate()] += order.count
            }

        })
        getChart(ordersbyday, '1')

    }


    if (type == "yearly") {
        let ordersbyyear = {};
        data1.forEach((order) => {
            const dateObject = new Date(order._id);

            if (!ordersbyyear[dateObject.getFullYear()]) {
                ordersbyyear[dateObject.getFullYear()] = order.count;
            } else {
                ordersbyyear[dateObject.getFullYear()] += order.count;
            }


        })

        getChart(ordersbyyear, '1')
    }

    if (type == "weekly") {
        let ordersbyweek = {
            Sun:0,
            Mon:0,
            Tue:0,
            Wed:0,
            Thu:0,
            Fri:0,
            Sat:0,
        };
        data1.forEach((order) => {
            
            const dateObject = new Date(order._id);
            if(dateObject.getMonth()== new Date().getMonth()){
                
                ordersbyweek[String(dateObject).slice(0,3)] += order.count;
            }
            
        })

        getChart(ordersbyweek, '1')
    }
}
