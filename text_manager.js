// 1.localStorage是浏览器的本地存储，只能存字符串
// 2.getItem通过键名取出内容（字符串）
// 3.JSON.parse将字符串转换为js对象/数组
// 4.找不到内容返回空数组
let tasks = JSON.parse(localStorage.getItem('my_tasks')) || [];

//实现本地存储，每调用一次就会覆盖原来的内容（键名相同）
function saveTasksToLocalStorage(){
    //将存有数据的数组tasks转化成字符串，键名'my_tasks'，存到浏览器
    localStorage.setItem('my_tasks', JSON.stringify(tasks));
}

//将数据显示到网页
function renderTable() {
    //1.ducument代表整个html文档对象，是所有dom操作的入口
    //（dom：用js去修改网页的内容，格式，样式）
    //2.通过getElementById方法找到id名为'table_task'的元素对象并返回
    //这里返回的是整个table表
    let table = document.getElementById('table_task');

    //1.table.rows返回table对象中所有<tr>标签构成的集合，可通过下标访问每一行
    //2.rows 是动态集合，删掉 rows[1] 后，原来的 rows[2] 会前移变成新的 rows[1]
    while (table.rows.length > 1) {
        // 删除除表头外的所有行
        table.deleteRow(1);
    }

    // 遍历 tasks 数组，重新插入行
    //1.forEach每次循环拿出tasks的一个元素（tasks是一个数组，按下标顺序取出）命名为task，每取出一个就执行箭头函数的代码，index是数组下标
    tasks.forEach((task, index) => {
        //在表格的最后一行插入
        let newRow = table.insertRow(-1);
        // ${}是模板字符串（``包起来的字符串）的插值语法，作用是把js表达式的值插进字符串里
        // 1.序号为当前索引值加1
        // 2.内容为当前task元素的content属性值
        // 3. <label>把单选框和后面的文字包在一起，当用户点击文字也能勾选
        //  type=radio表示该标签是一个单选圆圈，每一行的name不一样确保只有在同一行元素中的两种状态互斥
        //  ? : 是三元运算符，如果当前元素status属性是已/未完成，则该单选框会被勾选
        //  onchage是dom事件属性，当用户改变当前选择，会触发该事件调用changeStatus函数，用于更新值
        newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${task.content}</td>
            <td>
                <label><input type="radio" name="status_${task.id}" ${task.status === '已完成' ? 'checked' : ''} onchange="changeStatus(${task.id}, '已完成')">已完成</label>
                <label><input type="radio" name="status_${task.id}" ${task.status === '未完成' ? 'checked' : ''} onchange="changeStatus(${task.id}, '未完成')">未完成</label>
            </td>
            <td>${task.priority === 'high' ? '高' : '低'}</td>
            <td>
                <button onclick="deleterow(${task.id})">删除</button>
                <button onclick="editrow(${task.id}, this)">编辑</button>
            </td>
        `;
    });
}

// 单选切换状态时更新数据并保存
function changeStatus(id, status) {
    //.find()是数组的内置方法，用来遍历并返回第一个符合条件的元素
    //遍历每一个tasks的元素命名为t，判断t.id是否等于传入的参数
    let task = tasks.find(t => t.id === id);
    //如果拿到了则执行if语句
    if (task) {
        //更新该元素的状态
        task.status = status;
        //存储到本地浏览器
        saveTasksToLocalStorage();
    }
}
//删除行
function deleterow(id){
    //.filter():数组内置方法，筛选过滤，得到新数组
    //拿到不删除的所有元素组成的新数组重新赋值给tasks，实现删除行
    tasks = tasks.filter(task => task.id !== id);
    //保存
    saveTasksToLocalStorage();
    //重新加载新数组
    renderTable();
}

// 补充：editrow 接收 this，用 closest 拿到当前行
function editrow(id, button) {
    //得到想要进行编辑操作的该行元素
    let task = tasks.find(t => t.id === id);
    //不存在直接返回
    if (!task) return;
    //拿到行标签，row.cells返回一个类数组，可以通过下标去访问单元格
    let row = button.closest('tr');
    //得到单元格
    let contentCell = row.cells[1];
    let prioCell = row.cells[3];
    //获取原本的内容和优先级
    let oldContent = task.content;
    let oldPri = task.priority;

    contentCell.innerHTML = `<input type="text" value="${oldContent}" class="edit_input">`;
    prioCell.innerHTML = `
        <select class="edit_input">
            <option value="high" ${oldPri === 'high' ? 'selected' : ''}>高优先级</option>
            <option value="low" ${oldPri === 'low' ? 'selected' : ''}>低优先级</option>
        </select>
    `;
    //获取input标签和优先级标签
    let inputs = row.querySelectorAll('.edit_input');
    //获得焦点
    contentCell.querySelector('input').focus();

    inputs.forEach(function(input, index) {
        //给当前元素绑定'blur'失焦事件，当触发该事件执行后面的函数
        input.addEventListener('blur', function() {
            //如果内容不为空
            if (input.value.trim() !== '') {
                //0是input，则更新内容
                if (index === 0) {
                    task.content = input.value;
                    contentCell.innerText = input.value;
                }
                //1是优先级
                if (index === 1) {
                    task.priority = input.value;
                    prioCell.innerText = input.value === 'high' ? '高' : '低';
                }
            } else {//input为空就放回原来的元素
                if (index === 0) contentCell.innerText = oldContent;
                if (index === 1) prioCell.innerText = oldPri === 'high' ? '高' : '低';
            }
            saveTasksToLocalStorage();
        });
    });
}

function add_task(){
    //获取表单
    let task_form = document.getElementById('add_task');
    //得到task内容值
    let input_task = task_form.querySelector('input').value.trim();
    //得到优先级值
    let input_prio = task_form.querySelector('select').value;
    if(input_task === ''){
        alert('请输入内容');
        return;
    }
    let newTask = {
        id: Date.now(),//id唯一
        content: input_task,
        priority: input_prio,
        status: '未完成'
    };
    //把新增对象追加到tasks数组末尾
    tasks.push(newTask);
    saveTasksToLocalStorage();
    renderTable();

    task_form[0].value = "";//清空input
}

function select_row(button){
    let condition = document.getElementById('select_status').value;
    let table = document.querySelector('.table');
    let row = table.rows;
    for(let i = 1; i < row.length; i++){
        //得到第i行第三个单元格（状态）的input标签有radio属性的选择标签
        let current_row = row[i].cells[2].querySelectorAll('input[type="radio"]');
        let current_condition = '';
        if(current_row[0].checked){
            current_condition = '已完成';
        }else if(current_row[1].checked){
            current_condition = '未完成';
        }
        //如果用户筛选状态和遍历行的状态相同或者用户选的是全部
        if(condition === current_condition || condition === '全部'){
            //显示该行
            row[i].style.display = '';
        }else{
            //否则不显示
            row[i].style.display = 'none';
        }
    }
}

// 等网页的 HTML 结构（DOM）全部加载并解析完成之后，立刻执行 renderTable() 函数，把表格画出来。
document.addEventListener('DOMContentLoaded', function () {
    renderTable();
});
