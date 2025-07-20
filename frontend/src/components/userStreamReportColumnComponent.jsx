import React from 'react';
import Loader from 'react-loader-spinner';
import DatePicker from "react-datepicker";
import ClipLoader from "react-spinners/ClipLoader";

const UserStreamReportColumn = ({
    fetchUserReport,
    showEventUserStreamReport,
    userstreamreports,
    dateFilterActive,
    setDateCheckBox,
    selectedDateFilter,
    filterBasedOnDate,
    exportingStreamReport,
    exportsUserStreamRecords,
    fetchEventId,
    timeConvert,
}) => {
    if (!showEventUserStreamReport) {
        return null;
    }

    if (fetchUserReport) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching User Stream Reports. Please wait...</div>
            </div>
        );
    }

    return (
        <React.Fragment>
            {userstreamreports.length > 0 || true ? (
                <React.Fragment>
                    <div className="rooms-list-name-caption">Streaming Duration</div>
                    <br />
                    <div className="question-head">
                        <div className="pickerlabal">Filter Report By Date</div>
                        <input
                            type="checkbox"
                            name="datepickerneeded"
                            value={dateFilterActive}
                            checked={dateFilterActive}
                            onChange={() => setDateCheckBox(!dateFilterActive)}
                        />
                        <div className={dateFilterActive ? "" : "hide"}>
                            <DatePicker
                                selected={selectedDateFilter}
                                onChange={filterBasedOnDate}
                                onChangeRaw={(e) => e.preventDefault()}
                                className="custom-date"
                                timeIntervals={10}
                                dateFormat="MMMM d, yyyy "
                                timeCaption="time"
                                placeholderText="Select date "
                            />
                        </div>

                        {exportingStreamReport ? (
                            <button type="button" className="room-join-btn" disabled={exportingStreamReport}>
                                {exportingStreamReport ? 'Exporting...' : 'Export'}
                                {exportingStreamReport && <ClipLoader size={15} color={"#fff"} loading={true} />}
                            </button>
                        ) : (
                            <div>
                                <button className="room-join-btn" onClick={exportsUserStreamRecords}>Export Pdf</button>
                                <button className="room-join-btn csvbtn">
                                    <a target="_blank" rel="noopener noreferrer" href={process.env.REACT_APP_API_URL + 'event/downloadUserStreamReport/' + fetchEventId}>Export Excel</a>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="duration-statistics-tbl">
                        <div className="grid-table-row statistics-tbl-row grid-table-shadow">
                            <div className="grid-table-head"><div className="d-flex align-items-center">User</div></div>
                            <div className="grid-table-head"><div className="d-flex align-items-center justify-content-center">User Role</div></div>
                            <div className="grid-table-head"><div className="d-flex align-items-center justify-content-center">Duration</div></div>
                        </div>
                        <div className="duration-tbl-data-wrapper ">
                            {userstreamreports.length > 0 ? (
                                userstreamreports.map((userreport, index) => {
                                    const { start_time, end_time, name, role } = userreport;
                                    let streamedDuration = 0;
                                    if (start_time && end_time) {
                                        streamedDuration = Math.abs(new Date(start_time) - new Date(end_time)) / 1000;
                                    }

                                    return (
                                        <div className="grid-td grid-table-row" key={"userreport_" + index}>
                                            <div className="grid-table-data"><div className="grid-table-user">{name}</div></div>
                                            <div className="grid-table-data"><div className="grid-table-user d-flex justify-content-center">{role[0].toUpperCase() + role.slice(1)}</div></div>
                                            <div className="grid-table-data"><div className="grid-table-user d-flex justify-content-center">{timeConvert(streamedDuration)}</div></div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="d-flex align-items-center justify-content-center flex-column h-100">
                                    <div className="no-resourses-lst">
                                        <img src={require("../../img/no-data.svg")} alt="no-data" />
                                    </div>
                                    <div className="empty-list-txt">No reports available</div>
                                </div>
                            )}
                        </div>
                    </div>
                </React.Fragment>
            ) : (
                <div className="d-flex align-items-center justify-content-center flex-column h-100">
                    <div className="no-resourses-lst">
                        <img src={require("../../img/no-data.svg")} alt="no-data" />
                    </div>
                    <div className="empty-list-txt">No reports available</div>
                </div>
            )}
        </React.Fragment>
    );
};

export default UserStreamReportColumn; 