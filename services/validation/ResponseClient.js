function GenericSuccess(data) {
    return {
        success: true,
        data: data.data || null,
        status: data.status || "SUCCESS",
        message: data.message || "Request completed successfully."
    }
}

function GenericFailure(data) {
    return {
        success: false,
        data: data.data,
        status: "FAILED",
        message: data.error || "An error occured during request execution."
    }
}

function InternalServerError(data) {
    return { 
        success: false,
        status: "FAILED",
        message: data.error || "An error occured during request execution."
    }
}

function DBModifySuccess(data) {
    return {
        success: true,
        data: data.data,
        status: "SUCCESS",
        message: data.message || "Request completed successfully."
    }
}

function DBFetchSuccess(data) {
    return {
        success: true,
        pagination: data.pagination ? {
            page: data.page,
            pageSize: data.pageSize,
            totalItems: data.totalItems,
            totalPages: Math.ceil(data.totalItems / data.pageSize)
        } : null,
        data: data.data,
        status: "SUCCESS",
        message: data.message || "Request completed successfully."
    }
}

const ResponseClient = {
    GenericSuccess,
    GenericFailure,
    InternalServerError,
    DBModifySuccess,
    DBFetchSuccess
}

export default ResponseClient;