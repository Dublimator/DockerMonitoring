const moment = require("moment/moment");
const si = require("systeminformation");
const Docker = require('dockerode');

// Настройка Dockerode для взаимодействия с Docker API
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Функция для расчета загрузки CPU в процентах
const calculateCPUPercent = (cpuStats, precpuStats) => {
    if (!cpuStats || !precpuStats || !cpuStats.cpu_usage || !precpuStats.cpu_usage) {
        return 0;
    }

    const cpuDelta = cpuStats.cpu_usage.total_usage - precpuStats.cpu_usage.total_usage;
    const systemDelta = cpuStats.system_cpu_usage - precpuStats.system_cpu_usage;
    const numberOfCores = cpuStats.online_cpus;

    if (systemDelta > 0 && numberOfCores > 0) {
        const cpuPercent = (cpuDelta / systemDelta) * numberOfCores * 100;
        return cpuPercent;
    }
    return 0;
};

function calculatePercent(total, usage) {
    if (total === 0) {
        return 0; // чтобы избежать деления на ноль
    }
    const percent = (usage / total) * 100;
    return Math.round(percent);
}

async function getMetrics() {
    try {
        // Получаем список всех контейнеров, включая остановленные
        const containers = await docker.listContainers({ all: true });
        return await Promise.all(containers.map(async (containerInfo) => {
            const container = docker.getContainer(containerInfo.Id);
            const inspect = await container.inspect();

            if (containerInfo.State === 'running') {
                const stats = await container.stats({stream: false});

                // Время запуска контейнера
                const startedAt = moment(inspect.State.StartedAt);
                const uptime = moment.duration(moment().diff(startedAt)).humanize();

                // Процент использования CPU
                const cpuPercent = calculateCPUPercent(stats.cpu_stats, stats.precpu_stats);

                // Использование и лимит памяти
                const memoryUsage = stats.memory_stats.usage || 0;
                const memoryLimit = stats.memory_stats.limit || 0;
                const memoryUsageInMB = memoryUsage / 1048576; // В мегабайтах
                const memoryLimitInMB = memoryLimit / 1048576; // В мегабайтах

                return {
                    id: containerInfo.Id,
                    name: containerInfo.Names[0],
                    state: containerInfo.State,
                    uptime: uptime,
                    cpuPercent: cpuPercent.toFixed(2), // Процент использования CPU
                    memory: {
                        usage: memoryUsageInMB.toFixed(2), // Использование памяти в МБ
                        limit: memoryLimitInMB.toFixed(2)  // Лимит памяти в МБ
                    },
                    network: stats.networks
                };
            } else {
                return {
                    id: containerInfo.Id,
                    name: containerInfo.Names[0],
                    state: containerInfo.State // Состояние контейнера
                };
            }
        }))
    } catch (err) {
        console.log("getMetrics err: " + err)
    }

}



async function getSystemInfo() {
    try {
        const [disk, memory, cpuLoad] = await Promise.all([
            si.fsSize(),
            si.mem(),
            si.currentLoad()
        ]);

        const storage = {
            total: disk.reduce((acc, disk) => disk.size, 0),
            used: disk.reduce((acc, disk) => disk.used, 0),
            percent: calculatePercent(
                disk.reduce((acc, disk) =>  disk.size, 0),
                disk.reduce((acc, disk) =>  disk.used, 0)
            )
        };

        const ram = {
            total: memory.total,
            used: memory.active,
            percent: calculatePercent(memory.total, memory.active),
        };


        const cpu = {
            percent: Math.round(cpuLoad.currentLoad),
        };

        const uptime = si.time().uptime

        return { storage, ram, cpu, uptime };
    } catch (error) {
        console.error('Ошибка при получении системной информации:', error);
        throw error; // Перебрасываем ошибку для обработки в маршруте
    }
}

module.exports = {getMetrics, getSystemInfo}