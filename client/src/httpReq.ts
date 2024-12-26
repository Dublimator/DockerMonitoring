import axios from "axios";
import {URL_API} from "../config.ts";


interface ConfigAlert {
    telegram: string;
    alerts: {
        containerStopped: {
            condition: boolean;
        };
        ram: {
            condition: boolean;
            percent: string;
        };
        cpu: {
            condition: boolean;
            percent: string;
        };
        storage: {
            condition: boolean;
            percent: string;
        };
    };
}

const defaultConfigAlert : ConfigAlert  = {
    "telegram": "",
    "alerts": {
        "containerStopped": {
            "condition": false
        },
        "ram": {
            "condition": false,
            "percent": "0"
        },
        "cpu": {
            "condition": false,
            "percent": "0"
        },
        "storage": {
            "condition": false,
            "percent": "0"
        },
    }
}

let oldConfigAlert = defaultConfigAlert
let newConfigAlert = {}

export async function getConfigAlert() {

    if (oldConfigAlert === newConfigAlert) {

        return oldConfigAlert
    }
    try {
        const response = await axios.get(URL_API + "/get-alert-data");

        if ("error" in response || response.status === 404) {
            newConfigAlert = JSON.parse(JSON.stringify(defaultConfigAlert));
            oldConfigAlert = JSON.parse(JSON.stringify(defaultConfigAlert));
        } else {
            newConfigAlert = JSON.parse(JSON.stringify(response.data))
            oldConfigAlert = JSON.parse(JSON.stringify(response.data))

        }

    } catch (err) {
        newConfigAlert = JSON.parse(JSON.stringify(defaultConfigAlert));
        oldConfigAlert = JSON.parse(JSON.stringify(defaultConfigAlert));
    }

    return oldConfigAlert;
}

export async function saveConfigAlert() {

    if (oldConfigAlert === newConfigAlert) {
        console.log("no save")
        return true;
    } else {
        oldConfigAlert = JSON.parse(JSON.stringify(newConfigAlert))

        try {
            await axios.post(URL_API + "/save-alert-data", oldConfigAlert, {
                headers: {
                    'Content-Type': 'application/json',  // Указываем, что тело запроса - это JSON
                },
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}

export async function updateTelegram(newTelegram: string) {
    if ("telegram" in newConfigAlert) {
        newConfigAlert.telegram = newTelegram;
        return await saveConfigAlert();
    }

    return false;
}

export function updateAlerts(alerts: {}) {
    if ("alerts" in newConfigAlert) {
        newConfigAlert.alerts = alerts
    }
}

export function getTelegram(): string {
    return oldConfigAlert.telegram;
}

export function getAlerts() {
    if ("alerts" in newConfigAlert) {
        return oldConfigAlert.alerts;
    }
    return null;
}

export async function testMessage() {
    try {
        await axios.get(URL_API + "/send-test-message");
        return true
    } catch (err) {
        return false
    }
}
