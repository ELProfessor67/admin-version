import React from 'react';
import Loader from 'react-loader-spinner';
import NoDataImg from "@/assets/img/no-data.svg"

const RoomsAndReportsColumn = ({
    fetchRooms,
    eventRooms,
    viewAgenda,
    allowUserReportDisplay,
    viewUserReport,
    viewRecordings,
    pollsList,
    viewPollReport,
}) => {
    return (
        <div className="rooms-listing-tab">
            {fetchRooms ? (
                <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                    <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                    <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Rooms. Please wait...</div>
                </div>
            ) : (
                <React.Fragment>
                    {eventRooms.length > 0 ? (
                        <>
                            <div className="rooms-listing-caption meet-schedul-underline">rooms</div>
                            <div className="rooms-listing-whole-blk">
                                <div className="rooms-listing-wrapper">
                                    {eventRooms.map((room, key) => (
                                        <div className={"rooms-name-wrapper room_list room_" + room._id} key={key} onClick={() => viewAgenda(room._id, room.name, eventRooms.eventCode)}>{room.name}</div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex align-items-center justify-content-center flex-column h-100">
                            <div className="no-resourses-lst">
                                <img src={NoDataImg} alt="no-data" />
                            </div>
                            <div className="empty-list-txt">No rooms are available</div>
                        </div>
                    )}
                </React.Fragment>
            )}

            {allowUserReportDisplay && (
                <>
                    <div className="duration-statistics" onClick={viewUserReport}>Duration Statistics</div>
                    <div className="view-recordings-caption" onClick={viewRecordings}>View Recordings</div>
                </>
            )}
            
            {pollsList && pollsList.length > 0 && (
                <React.Fragment>
                    <div className="polls-lst-caption">Polls</div>
                    <div className="polls-lst-whole-blk">
                        <div className="polls-lst-wrapper">
                            {pollsList.map((poll, index) => (
                                <div className={"polls-name-wrapper poll_list poll_" + poll._id} key={"polls_" + index} onClick={() => viewPollReport(poll._id, pollsList['event_id'], poll.title)}>{poll.title}</div>
                            ))}
                        </div>
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};

export default RoomsAndReportsColumn; 