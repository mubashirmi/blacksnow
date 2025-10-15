import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { useGlobalState } from '../../store';

const useRest = () => {
    const { showLoading, hideLoading } = useGlobalState();

    const makeCall = async (type: string, path: string, body: object, loading: boolean) => {
        let callResults;
        notifications.clean();

        const params = {
            noCache: true,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
            },
        };

        try {
            if (loading) {
                showLoading();
            }

            switch (type) {
                case 'GET':
                    callResults = await axios.get(path, params);
                    break;
                case 'POST':
                    callResults = await axios.post(path, body, params);
                    break;
                case 'PUT':
                    callResults = await axios.put(path, body, params);
                    break;
                case 'DELETE':
                    callResults = await axios.delete(path, params);
                    break;
            }

            if (loading) {
                hideLoading();
            }

            if (callResults?.request?.status === 200 && callResults?.data?.success === false) {
                notifications.show({
                    message: callResults.data?.message || 'Error making call.',
                    color: 'red',
                    autoClose: false,
                });
            }

            return callResults;
        } catch (e: any) {
            if (loading) {
                hideLoading();
            }
            return e;
        }
    };

    const restGet = (path: string, loading = true) => {
        return makeCall('GET', path, {}, loading);
    };

    const restPut = async (path: string, body: object, loading = true) => {
        return makeCall('PUT', path, body, loading);
    };

    const restPost = (path: string, body: object, loading = true) => {
        return makeCall('POST', path, body, loading);
    };

    const restDelete = (path: string, loading = true) => {
        return makeCall('DELETE', path, {}, loading);
    };

    return {
        restGet,
        restPut,
        restPost,
        restDelete,
    };
};

export default useRest;
