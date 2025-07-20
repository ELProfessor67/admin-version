import React from 'react';
import Loader from 'react-loader-spinner';
import ClipLoader from "react-spinners/ClipLoader";
import moment from "moment";

const PollReportColumn = ({
    fetchPollReport,
    showPollReports,
    pollreports,
    exportingPollReport,
    exportsPollsRecords,
    fetchedEventDetails,
    format_poll_percentage,
    timezone
}) => {
    if (!showPollReports) {
        return null;
    }

    if (fetchPollReport) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Poll Reports. Please wait...</div>
            </div>
        );
    }

    return (
        <React.Fragment>
            {pollreports.length > 0 ? (
                <React.Fragment>
                    <div className="question-head">
                        <div className="rooms-list-name-caption">Questions</div>
                        <button type="button" className="room-join-btn" disabled={exportingPollReport} onClick={exportsPollsRecords}>
                            {exportingPollReport ? 'Exporting...' : 'Export'}
                            {exportingPollReport && <ClipLoader size={15} color={"#fff"} loading={true} />}
                        </button>
                    </div>
                    <div className="polls-ques-whole-blk">
                        {pollreports.map((pollreport, index) => (
                            <Poll key={"pollreport_" + index} pollreport={pollreport} index={index} format_poll_percentage={format_poll_percentage} />
                        ))}
                        <div id="exportPollsRecordsTopDiv">
                            <div id="exportPollsRecords" hidden>
                                <div className="Even_Details">
                                    <div className="logo">
                                        <img alt="logo" src={require("../../img/logo-2-01.png")} />
                                    </div>
                                    {fetchedEventDetails &&
                                        <>
                                            <div className="eventDetails">
                                                <div className="eventName d-flex mb-3"> Name : {fetchedEventDetails.name} </div>
                                                <div className="eventDescription d-flex mb-3"> Description :  {fetchedEventDetails.description} </div>
                                                <div className="eventStartTime d-flex mb-3">Start Time :  {moment(fetchedEventDetails.start_time).tz(timezone).format('Do MMM YYYY, hh:mm a')} </div>
                                                <div className="eventEndTime d-flex mb-3">End Time : {moment(fetchedEventDetails.end_time).tz(timezone).format('Do MMM YYYY, hh:mm a')} </div>
                                                <div className="pollTitle d-flex mb-3">Poll Name : {fetchedEventDetails.poll_title}</div>
                                            </div>
                                            <div className="pollTitle">Questions</div>
                                        </>
                                    }
                                </div>
                                <div className="">
                                    {pollreports.map((pollreport, index) => (
                                        <Poll key={"pollreport_export_" + index} pollreport={pollreport} index={index} format_poll_percentage={format_poll_percentage} isExport={true} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            ) : (
                <div className="d-flex align-items-center justify-content-center flex-column h-100">
                    <div className="no-resourses-lst">
                        <img src={require("../../img/no-data.svg")} alt="no-data" />
                    </div>
                    <div className="empty-list-txt">No poll questions available</div>
                </div>
            )}
        </React.Fragment>
    );
};

const Poll = ({ pollreport, index, format_poll_percentage, isExport = false }) => {
    const { question, options, report, responses } = pollreport;
    return (
        <div className="polls-ques-container">
            <div className="polls-ques-part"><span>{index + 1}.</span>{question}</div>
            <div className="polls-response-blk">
                {options.map((option, key) => {
                    const optionKey = Object.keys(option)[0];
                    const optionValue = Object.values(option)[0];
                    let percentageValue = 0;
                    let responseCount = 0;

                    const percentage = report.find(p => Object.keys(p)[0] === optionKey);
                    if (percentage) {
                        percentageValue = Object.values(percentage)[0];
                    }

                    const response = responses.filter(r => r.answer === optionKey);
                    if (response) {
                        responseCount = response.length;
                    }

                    return (
                        <div className="d-flex align-items-center poll-response-container" key={"optionvalues_" + key}>
                            <div className="d-flex align-items-center justify-content-between w-100">
                                <div className="d-flex align-items-center polls-choice-ans">
                                    <div className="polls-choice">{optionKey.toUpperCase()}.</div>
                                    <div className={isExport ? "polls-ans1" : "polls-ans"}>{optionValue}</div>
                                </div>
                                <div className="d-flex align-items-center polls-ans-right-blk">
                                    <div className="d-flex align-items-center polls-attendees-count">{responseCount}</div>
                                    <div className="polls-percentage">{format_poll_percentage(percentageValue)}%</div>
                                </div>
                            </div>
                            <div className="polls-progress-indicator-color" style={{ "width": percentageValue + "%" }}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PollReportColumn; 