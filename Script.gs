/**
 * Вычисляет перцентиль времени завершения задач при заданных параметрах.
 *
 * @param {number} x1 Длительность простой задачи (полная)
 * @param {number} x2 Длительность сложной задачи (полная)
 * @param {number} y1 Время до ревью простой задачи
 * @param {number} y2 Время до ревью сложной задачи
 * @param {number} N_s Количество простых задач
 * @param {number} N_c Количество сложных задач
 * @param {number} p Перцентиль (0 < p < 1)
 * @return {number} Значение p-перцентиля времени завершения всех задач.
 */
function CALC_DARATION(x1, x2, y1, y2, N_s, N_c, p) {
  var tasks = [];
  for (var i = 0; i < N_s; i++) {
    tasks.push({type: 'S', X: x1, Y: y1});
  }
  for (var j = 0; j < N_c; j++) {
    tasks.push({type: 'C', X: x2, Y: y2});
  }

  var allPermutations = permutationsForTasks(tasks);

  // Ограничиваем количество перестановок для производительности, если слишком много
  if (allPermutations.length > 10000) {
    allPermutations = sampleArray(allPermutations, 10000);
  }

  var completionTimes = allPermutations.map(function(perm){
    return calcCompletionTime(perm);
  });

  completionTimes.sort(function(a,b){return a-b;});

  var idx = Math.floor(p * completionTimes.length);
  if (idx < 0) idx = 0;
  if (idx >= completionTimes.length) idx = completionTimes.length - 1;

  return completionTimes[idx];
}

/**
 * Вычисляет время завершения для конкретной последовательности задач.
 */
function calcCompletionTime(perm) {
  var S = 0; 
  var maxFinishReview = 0;
  
  for (var i = 0; i < perm.length; i++) {
    var task = perm[i];
    var finishReview = S + task.X; 
    if (finishReview > maxFinishReview) {
      maxFinishReview = finishReview;
    }
    S += task.Y;
  }
  
  var devAll = S;
  return Math.max(devAll, maxFinishReview);
}

/**
 * Генерирует все уникальные перестановки задач, учитывая повторяющиеся типы задач.
 */
function permutationsForTasks(tasks) {
  var types = tasks.map(function(t){return t.type;});
  types.sort();

  var permsStr = [];
  permuteUnique(types, 0, permsStr);

  // Определим x1,y1,x2,y2, исходя из массива tasks
  var x1, y1, x2, y2;
  for (var i=0; i<tasks.length; i++) {
    if (tasks[i].type === 'S') {
      x1 = tasks[i].X; y1 = tasks[i].Y;
      break;
    }
  }
  for (var i=0; i<tasks.length; i++) {
    if (tasks[i].type === 'C') {
      x2 = tasks[i].X; y2 = tasks[i].Y;
      break;
    }
  }

  var result = permsStr.map(function(seq){
    return seq.map(function(t) {
      return t === 'S' ? {type:'S', X:x1, Y:y1} : {type:'C', X:x2, Y:y2};
    });
  });
  
  return result;
}

/**
 * Рекурсивная функция для генерации уникальных перестановок массива.
 */
function permuteUnique(arr, index, result) {
  if (index === arr.length) {
    result.push(arr.slice());
    return;
  }
  
  for (var i = index; i < arr.length; i++) {
    if (i !== index && arr[i] === arr[index]) continue;
    swap(arr, i, index);
    permuteUnique(arr, index+1, result);
    swap(arr, i, index);
  }
}

function swap(arr, i, j) {
  var tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

/**
 * Выборка случайной подвыборки.
 */
function sampleArray(arr, count) {
  var res = [];
  var usedIndexes = {};
  while (res.length < count && res.length < arr.length) {
    var r = Math.floor(Math.random() * arr.length);
    if (!usedIndexes[r]) {
      usedIndexes[r] = true;
      res.push(arr[r]);
    }
  }
  return res;
}
